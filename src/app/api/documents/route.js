// src/app/api/documents/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-client";
import { STORAGE_BUCKET } from "../../../lib/constants";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  try {
    let query = supabaseAdmin
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    // If not admin, restrict visibility (though UI currently restricts dashboard to Admin entirely)
    if (role && role !== "Administrator") {
      query = query.contains("allowed_roles", [role]);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id, storage_path } = await req.json();

    // Delete from storage using extracted filename from URL
    const fileName = storage_path.split("/").pop();
    await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([fileName]);

    // Delete from Postgres (Cascade deletes chunks automatically)
    const { error } = await supabaseAdmin
      .from("documents")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, roles } = await req.json();
    if (!roles || roles.length === 0)
      return NextResponse.json(
        { error: "Roles cannot be empty." },
        { status: 400 },
      );

    // Execute our SQL RPC function to update across all chunks securely
    const { error } = await supabaseAdmin.rpc("update_document_roles", {
      doc_id: id,
      new_roles: roles,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
