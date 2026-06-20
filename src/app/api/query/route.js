// src/app/api/query/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-client";
import { getLLM, getEmbeddings } from "../../../lib/ai-adapter";
import { getSystemPrompt } from "../../../lib/constants";

export async function POST(req) {
  try {
    const { question, role = "General" } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "No question provided" },
        { status: 400 },
      );
    }

    // 1. Convert the user's question into a mathematical vector embedding
    const embeddingsEngine = getEmbeddings();
    const rawQueryEmbedding = await embeddingsEngine.embedQuery(question);

    // THE FIX: Slice the query vector to exactly 768 dimensions so it perfectly
    // matches the cropped vectors we stored in the database during ingestion.
    const queryEmbedding = rawQueryEmbedding.slice(0, 768);

    // 2. Query Supabase using our match_document_chunks RPC function
    const { data: matchedChunks, error: matchError } = await supabaseAdmin.rpc(
      "match_document_chunks",
      {
        query_embedding: queryEmbedding, // Pass the mathematically cropped array
        match_threshold: 0.5,
        match_count: 5,
        filter_role: role,
      },
    );

    if (matchError) throw new Error("Match Failure: " + matchError.message);

    // 3. Structural Boundary: Check if any documents matched
    if (!matchedChunks || matchedChunks.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find any relevant company documents that you have permission to view to answer this question.",
        sources: [],
      });
    }

    // 4. Construct Context block and Extract citations
    const contextText = matchedChunks
      .map((chunk, index) => `[Source ${index + 1}]: ${chunk.content}`)
      .join("\n\n");
    const uniqueSources = [
      ...new Set(
        matchedChunks.map(
          (chunk) => chunk.metadata?.file_name || "Unknown Document",
        ),
      ),
    ];

    // 5. Execute the Large Language Model call
    const llm = getLLM();
    const response = await llm.invoke(getSystemPrompt(contextText, question));
    const aiAnswer = response.content || response.text || String(response);

    return NextResponse.json(
      { answer: aiAnswer, sources: uniqueSources },
      { status: 200 },
    );
  } catch (error) {
    console.error("Query Execution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
