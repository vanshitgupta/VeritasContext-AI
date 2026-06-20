// src/components/ChatView.js
"use client";

import { useState } from "react";

/**
 * Conversational Knowledge Retrieval Interface
 * Allows users to query the vector database. It strictly passes their `role`
 * to the backend to ensure they only receive answers from documents they are authorized to view.
 */
export default function ChatView({ role }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // Executes the search and LLM generation
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion(""); // Clear input immediately for better UX
    setIsQuerying(true);

    // Add user question to the chat history array
    setHistory((prev) => [...prev, { sender: "user", text: userQ }]);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Crucial: The role dictates the database row-level isolation
        body: JSON.stringify({ question: userQ, role }),
      });

      const data = await res.json();

      // Add the AI response and document citations to the history
      setHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || data.error,
          sources: data.sources,
        },
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Critical system pipeline failure during retrieval.",
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const mono = { fontFamily: "'JetBrains Mono', monospace" };
  const fraunces = { fontFamily: "'Fraunces', serif" };

  return (
    <section className="bg-[#12161D] rounded-lg border border-[#232934] flex flex-col h-[700px] shadow-2xl overflow-hidden">
      {/* Dossier accent strip, consistent with the rest of the archive */}
      <div className="h-1 bg-gradient-to-r from-[#C8A24A]/0 via-[#C8A24A]/60 to-[#C8A24A]/0" />

      {/* Scrollable Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#0B0E13]">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#5B6473] space-y-3">
            <svg
              className="w-12 h-12 text-[#232934]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p
              className="text-sm font-medium text-[#8891A0]"
              style={fraunces}
            >
              Archive connection stable
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-[#4B5363]"
              style={mono}
            >
              Results isolated to {role} records
            </p>
          </div>
        ) : (
          history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Message Bubble styling depends on the sender */}
              <div
                className={`max-w-[90%] md:max-w-[75%] rounded-lg p-4 text-sm shadow-md ${
                  msg.sender === "user"
                    ? "bg-[#C8A24A]/10 text-[#ECE8DC] border border-[#C8A24A]/40 rounded-br-sm"
                    : "bg-[#181D26] text-[#ECE8DC] border border-[#232934] rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>

                {/* Document Citations Rendering */}
                {msg.sources?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#232934] flex flex-wrap gap-2">
                    <span
                      className="block w-full text-[10px] font-bold uppercase tracking-[0.18em] text-[#C8A24A]"
                      style={mono}
                    >
                      Verified Citations
                    </span>
                    {msg.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="bg-[#0B0E13] border border-[#232934] px-2.5 py-1.5 rounded text-[11px] font-medium text-[#8891A0] flex items-center gap-1.5"
                        style={mono}
                      >
                        <svg
                          className="w-3 h-3 text-[#C8A24A]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isQuerying && (
          <div className="flex justify-start">
            <p
              className="text-xs text-[#C8A24A] font-medium animate-pulse bg-[#C8A24A]/10 border border-[#C8A24A]/30 px-4 py-2 rounded-md uppercase tracking-[0.1em]"
              style={mono}
            >
              Synthesizing contextual vectors...
            </p>
          </div>
        )}
      </div>

      {/* Query Input Form */}
      <form
        onSubmit={handleQuery}
        className="p-4 border-t border-[#232934] bg-[#12161D] flex gap-3"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Search the enterprise knowledge base..."
          className="flex-1 bg-[#0B0E13] border border-[#232934] rounded-md px-5 py-3.5 text-sm text-[#ECE8DC] placeholder:text-[#4B5363] focus:border-[#C8A24A] outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isQuerying || !question.trim()}
          className="bg-[#C8A24A] disabled:bg-[#1B2029] disabled:text-[#4B5363] hover:bg-[#E3C988] text-[#0B0E13] font-bold px-8 py-3.5 rounded-md text-xs uppercase tracking-[0.12em] transition-all flex items-center gap-2"
        >
          Execute
        </button>
      </form>
    </section>
  );
}
