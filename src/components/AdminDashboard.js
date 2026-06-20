// src/components/AdminDashboard.js
"use client";

import { useState, useEffect } from "react";
// Fixed relative imports
import { SYSTEM_ROLES, APP_CONFIG } from "../lib/constants";

/**
 * Administrator Document Manager
 * This is the control center for the application. It allows Admins to upload new PDFs,
 * view the existing document grid, delete files, and update role-based access arrays.
 */
export default function AdminDashboard() {
  // Navigation State between Upload form and Document Grid
  const [view, setView] = useState("upload");

  // Data States
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Upload Form States
  const [file, setFile] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([
    SYSTEM_ROLES.GENERAL,
    SYSTEM_ROLES.ADMIN,
  ]);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Edit Modal States
  const [activeDoc, setActiveDoc] = useState(null);
  const [editRoles, setEditRoles] = useState([]);

  // Fetch documents from Supabase on load and when switching to the 'manage' view
  useEffect(() => {
    if (view === "manage") fetchDocuments();
  }, [view]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();

      // Ensure we only set the state to an array, even if the backend fails
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
      setDocuments([]);
    }
  };

  // Handles submitting the multipart form data for PII scrubbing and vectorization
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus({ loading: true, msg: "Indexing context vectors..." });

    const formData = new FormData();
    formData.append("file", file);
    selectedRoles.forEach((r) => formData.append("roles", r)); // Send array of roles

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setUploadStatus({
          loading: false,
          msg: "Document secured.",
          error: false,
        });
        setFile(null); // Clear state
        document.getElementById("file-upload").value = ""; // Clear file input UI
      } else {
        setUploadStatus({ loading: false, msg: data.error, error: true });
      }
    } catch {
      setUploadStatus({
        loading: false,
        msg: "Network pipeline failed.",
        error: true,
      });
    }
  };

  // Helper to manage checkbox arrays. Prevents unchecking the 'Administrator' role.
  const toggleRole = (role, currentState, stateSetter) => {
    if (role === SYSTEM_ROLES.ADMIN) return;
    stateSetter((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  // Destroys the file in storage and cascades deletion of vectors in the database
  const handleDelete = async (doc) => {
    if (!confirm(`Permanently delete ${doc.file_name}? This cannot be undone.`))
      return;
    await fetch("/api/documents", {
      method: "DELETE",
      body: JSON.stringify(doc),
      headers: { "Content-Type": "application/json" },
    });
    fetchDocuments(); // Refresh grid
  };

  // Executes the SQL RPC function to update roles across thousands of chunks instantly
  const handleSaveRoles = async () => {
    if (editRoles.length === 0) return alert("Roles cannot be empty.");
    await fetch("/api/documents", {
      method: "PATCH",
      body: JSON.stringify({ id: activeDoc.id, roles: editRoles }),
      headers: { "Content-Type": "application/json" },
    });
    setActiveDoc(null); // Close modal
    fetchDocuments(); // Refresh grid
  };

  // Client-side filtering logic for the Grid search bar
  const filteredDocs = documents.filter(
    (doc) =>
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (roleFilter === "All" || doc.allowed_roles.includes(roleFilter)),
  );

  const fraunces = { fontFamily: "'Fraunces', serif" };
  const mono = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div className="space-y-6">
      {/* 1. Dossier Tab Navigation — index-tab styling instead of generic pill tabs */}
      <div className="flex gap-1 border-b border-[#232934]">
        <button
          onClick={() => setView("upload")}
          className={`relative px-5 py-3 font-bold text-xs uppercase tracking-[0.12em] transition-colors rounded-t-md ${view === "upload" ? "bg-[#12161D] text-[#C8A24A]" : "text-[#5B6473] hover:text-[#8891A0]"}`}
        >
          Ingest Data
          {view === "upload" && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#C8A24A]" />
          )}
        </button>
        <button
          onClick={() => setView("manage")}
          className={`relative px-5 py-3 font-bold text-xs uppercase tracking-[0.12em] transition-colors rounded-t-md ${view === "manage" ? "bg-[#12161D] text-[#C8A24A]" : "text-[#5B6473] hover:text-[#8891A0]"}`}
        >
          Data Governance Hub
          {view === "manage" && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#C8A24A]" />
          )}
        </button>
      </div>

      {/* 2. Upload Interface View */}
      {view === "upload" && (
        <section className="bg-[#12161D] rounded-lg p-6 md:p-8 border border-[#232934] shadow-xl">
          <div className="mb-8">
            <p
              className="text-[10px] uppercase tracking-[0.25em] text-[#C8A24A] font-semibold mb-2"
              style={mono}
            >
              Step 01
            </p>
            <h2
              className="text-xl font-semibold text-[#ECE8DC] mb-2"
              style={fraunces}
            >
              Secure File Ingestion
            </h2>
            <p className="text-sm text-[#8891A0]">
              Strictly <b className="text-[#ECE8DC]">PDF only</b>. Max size:{" "}
              <b className="text-[#ECE8DC]">{APP_CONFIG.MAX_FILE_SIZE_MB}MB</b>.
            </p>
          </div>

          <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-10">
            {/* Roles Selection Column */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#8891A0]">
                Visibility Mapping
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(SYSTEM_ROLES).map((role) => (
                  <label
                    key={role}
                    className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer text-sm font-medium transition-all ${selectedRoles.includes(role) ? "bg-[#C8A24A]/10 border-[#C8A24A]/50 text-[#E3C988]" : "bg-[#0B0E13] border-[#232934] text-[#5B6473] hover:border-[#3A4250]"}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedRoles.includes(role)}
                      onChange={() =>
                        toggleRole(role, selectedRoles, setSelectedRoles)
                      }
                      disabled={role === SYSTEM_ROLES.ADMIN}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            {/* File Input & Submit Column */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#8891A0]">
                Source Document
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full bg-[#0B0E13] text-[#8891A0] text-sm border border-[#232934] file:mr-4 file:py-3 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-[0.08em] file:bg-[#C8A24A] file:text-[#0B0E13] hover:file:bg-[#E3C988] cursor-pointer rounded-md overflow-hidden transition-all"
              />
              <button
                type="submit"
                disabled={!file || uploadStatus?.loading}
                className="w-full bg-[#C8A24A] disabled:bg-[#1B2029] disabled:text-[#4B5363] hover:bg-[#E3C988] text-[#0B0E13] font-bold py-3.5 rounded-md text-xs uppercase tracking-[0.12em] transition-all"
              >
                {uploadStatus?.loading
                  ? "Encrypting & Indexing..."
                  : "Upload Context"}
              </button>

              {/* Status Message Display */}
              {uploadStatus && (
                <p
                  className={`text-sm p-4 rounded-md font-medium border ${uploadStatus.error ? "bg-[#C1503F]/10 text-[#E08877] border-[#C1503F]/40" : "bg-[#4FA98C]/10 text-[#7FCBB3] border-[#4FA98C]/40"}`}
                >
                  {uploadStatus.msg}
                </p>
              )}
            </div>
          </form>
        </section>
      )}

      {/* 3. Document Management Grid View */}
      {view === "manage" && (
        <section className="space-y-6">
          {/* Filtering Tools */}
          <div className="flex flex-col sm:flex-row gap-4 bg-[#12161D] p-4 rounded-lg border border-[#232934]">
            <input
              type="text"
              placeholder="Search knowledge base by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#0B0E13] border border-[#232934] rounded-md px-5 py-3 text-sm text-[#ECE8DC] placeholder:text-[#4B5363] focus:outline-none focus:border-[#C8A24A] transition-colors"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0B0E13] border border-[#232934] rounded-md px-5 py-3 text-sm text-[#ECE8DC] focus:outline-none focus:border-[#C8A24A] transition-colors"
              style={mono}
            >
              <option value="All">All Departments</option>
              {Object.values(SYSTEM_ROLES).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group relative bg-[#12161D] rounded-lg border border-[#232934] overflow-hidden hover:border-[#C8A24A]/50 transition-all shadow-xl"
              >
                {/* Dossier tab accent strip */}
                <div className="h-1 bg-gradient-to-r from-[#C8A24A]/0 via-[#C8A24A]/60 to-[#C8A24A]/0" />

                {/* Visual Thumbnail Area */}
                <div className="h-40 bg-[#0B0E13] flex items-center justify-center relative">
                  {/* Default PDF Icon */}
                  <svg
                    className="w-16 h-16 text-[#232934] transition-transform group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-[#0B0E13]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    {/* View/Download Source Link */}
                    <a
                      href={doc.storage_path}
                      target="_blank"
                      rel="noreferrer"
                      title="View Source PDF"
                      className="p-3 bg-[#C8A24A] rounded-full text-[#0B0E13] hover:bg-[#E3C988] transition-colors hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </a>
                    {/* Edit Roles Trigger */}
                    <button
                      onClick={() => {
                        setActiveDoc(doc);
                        setEditRoles(doc.allowed_roles);
                      }}
                      title="Edit Metadata & Roles"
                      className="p-3 bg-[#232934] rounded-full text-[#ECE8DC] hover:bg-[#3A4250] transition-colors hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    {/* Delete Trigger */}
                    <button
                      onClick={() => handleDelete(doc)}
                      title="Delete Document"
                      className="p-3 bg-[#C1503F]/80 rounded-full text-[#F5D6CF] hover:bg-[#C1503F] hover:text-white transition-colors hover:scale-110"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Metadata Display Below Thumbnail */}
                <div className="p-5 bg-[#12161D] border-t border-[#232934]">
                  <p
                    className="font-bold text-sm text-[#ECE8DC] truncate"
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </p>
                  <p
                    className="text-[10px] text-[#C8A24A] mt-1 uppercase tracking-[0.18em] font-bold"
                    style={mono}
                  >
                    {doc.allowed_roles.length} Access Role
                    {doc.allowed_roles.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state — invitation to act, in the archive's own voice */}
          {filteredDocs.length === 0 && (
            <div className="text-center py-16 border border-dashed border-[#232934] rounded-lg">
              <p className="text-sm text-[#5B6473]">
                No documents match this search.
              </p>
            </div>
          )}

          {/* 4. Edit Role/Metadata Modal Layer */}
          {activeDoc && (
            <div className="fixed inset-0 bg-[#0B0E13]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-[#12161D] border border-[#232934] rounded-lg w-full max-w-md p-6 shadow-2xl relative">
                {/* Dossier tab accent strip */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8A24A] via-[#E3C988] to-[#C8A24A] rounded-t-lg" />

                {/* Close Modal Button */}
                <button
                  onClick={() => setActiveDoc(null)}
                  className="absolute top-5 right-5 text-[#5B6473] hover:text-[#ECE8DC] transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <p
                  className="text-[10px] uppercase tracking-[0.25em] text-[#C8A24A] font-semibold mb-1 mt-2"
                  style={mono}
                >
                  Record Detail
                </p>
                <h3
                  className="text-xl font-semibold text-[#ECE8DC] pr-8 truncate mb-6"
                  style={fraunces}
                >
                  Document Metadata
                </h3>

                {/* Immutal File Stats */}
                <div className="space-y-3 mb-8 bg-[#0B0E13] p-5 rounded-md border border-[#232934]">
                  <p className="text-sm flex justify-between">
                    <span className="text-[#5B6473] font-medium">Filename</span>{" "}
                    <span className="text-[#ECE8DC] font-bold truncate max-w-[200px]">
                      {activeDoc.file_name}
                    </span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-[#5B6473] font-medium">
                      File Size
                    </span>{" "}
                    <span className="text-[#ECE8DC] font-bold" style={mono}>
                      {activeDoc.file_size}
                    </span>
                  </p>
                  <p className="text-sm flex justify-between">
                    <span className="text-[#5B6473] font-medium">
                      Indexed On
                    </span>{" "}
                    <span className="text-[#ECE8DC] font-bold" style={mono}>
                      {new Date(activeDoc.uploaded_at).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                {/* Role Modification Controls */}
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8891A0] mb-4">
                  Modify Access Logic
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {Object.values(SYSTEM_ROLES).map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer text-xs font-bold transition-all ${editRoles.includes(role) ? "bg-[#C8A24A]/15 border-[#C8A24A] text-[#E3C988]" : "bg-[#0B0E13] border-[#232934] text-[#5B6473] hover:border-[#3A4250]"}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={editRoles.includes(role)}
                        onChange={() =>
                          toggleRole(role, editRoles, setEditRoles)
                        }
                        disabled={role === SYSTEM_ROLES.ADMIN}
                      />
                      {role}
                    </label>
                  ))}
                </div>

                {/* Submit Edits */}
                <button
                  onClick={handleSaveRoles}
                  className="w-full bg-[#C8A24A] text-[#0B0E13] font-bold py-3.5 rounded-md hover:bg-[#E3C988] transition-colors text-xs uppercase tracking-[0.12em]"
                >
                  Apply Architecture Updates
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
