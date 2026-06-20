// src/app/api/ingest/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-client";
import { getEmbeddings } from "../../../lib/ai-adapter";
import { enforceGuardrails } from "../../../lib/guardrails";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  APP_CONFIG,
  SYSTEM_ROLES,
  STORAGE_BUCKET,
} from "../../../lib/constants";

// FIXED: Using LangChain's dedicated Node.js Server PDF Loader
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file"); // Native File/Blob object
    let allowedRoles = formData.getAll("roles");

    // Ensure Administrator always has access to uploaded files
    if (!allowedRoles.includes(SYSTEM_ROLES.ADMIN)) {
      allowedRoles.push(SYSTEM_ROLES.ADMIN);
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Enforce strict file size limits
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > APP_CONFIG.MAX_FILE_SIZE_MB) {
      return NextResponse.json(
        {
          error: `File exceeds maximum size of ${APP_CONFIG.MAX_FILE_SIZE_MB}MB.`,
        },
        { status: 400 },
      );
    }

    // =========================================================================
    // STABLE EXTRACTION LOGIC
    // We pass the native File Blob directly into LangChain's FS PDFLoader.
    // LangChain handles the CommonJS/pdf-parse abstraction internally.
    // =========================================================================
    const loader = new PDFLoader(file, { splitPages: false });
    const loadedDocuments = await loader.load();

    if (!loadedDocuments || loadedDocuments.length === 0) {
      throw new Error("Could not extract text from the provided PDF.");
    }

    // FIX 1: Map over ALL pages to extract complete text (not just the first page)
    const rawText = loadedDocuments.map((doc) => doc.pageContent).join("\n\n");

    // FIX 2: Strip invisible Null Bytes (\u0000) that silently crash Google Embeddings
    const safeText = rawText.replace(/\0/g, "").replace(/\u0000/g, "");

    // Execute security guardrails
    const cleanText = enforceGuardrails(safeText);

    // Split text into overlapping mathematical chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.createDocuments([cleanText]);

    // Upload physical file to Supabase storage bucket
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, { contentType: file.type });

    if (storageError) {
      throw new Error("Storage Upload Failed: " + storageError.message);
    }

    // Generate public URL and format file size for the database
    const publicUrl = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName).data.publicUrl;
    const formattedSize =
      sizeInMB < 1
        ? `${(sizeInMB * 1024).toFixed(2)} KB`
        : `${sizeInMB.toFixed(2)} MB`;

    // Insert master metadata record into Postgres
    const { data: docData, error: docError } = await supabaseAdmin
      .from("documents")
      .insert({
        file_name: file.name,
        storage_path: publicUrl,
        uploaded_by: "System Admin",
        file_size: formattedSize,
        allowed_roles: allowedRoles,
      })
      .select("id")
      .single();

    if (docError) {
      throw new Error("Database Insertion Failed: " + docError.message);
    }

    // Generate embeddings via Google API and prepare bulk insert payload
    const embeddings = getEmbeddings();
    const chunkInserts = [];

    for (const chunk of chunks) {
      if (!chunk.pageContent || chunk.pageContent.trim() === "") continue;

      try {
        // 1. Fetch the raw vector (which might come back as 3072 dimensions)
        const rawVector = await embeddings.embedQuery(chunk.pageContent);

        // 2. THE FIX: Physically slice the array to exactly 768 dimensions.
        // This leverages Matryoshka representation learning to keep the data highly accurate
        // while strictly enforcing the database limit.
        const vector = rawVector.slice(0, 768);

        // 3. Hard validation before database insertion
        if (vector && vector.length === 768) {
          chunkInserts.push({
            document_id: docData.id,
            content: chunk.pageContent,
            embedding: vector,
            metadata: { allowed_roles: allowedRoles, file_name: file.name },
          });
        } else {
          console.warn("Skipped chunk: Vector length invalid.");
        }
      } catch (err) {
        console.warn(
          "Failed to embed specific chunk, skipping to next:",
          err.message,
        );
      }
    }

    // Final safety net: Did we get ANY valid math back?
    if (chunkInserts.length === 0) {
      throw new Error(
        "Failed to generate any valid AI vectors from the document text.",
      );
    }

    // Batch insert valid vectors into Postgres
    const { error: chunkError } = await supabaseAdmin
      .from("document_chunks")
      .insert(chunkInserts);

    if (chunkError) {
      throw new Error("Vector Insertion Failed: " + chunkError.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully secured and indexed ${chunkInserts.length} mathematical chunks.`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ingestion Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
