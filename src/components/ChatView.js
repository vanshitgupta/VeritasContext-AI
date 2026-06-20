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

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[700px] shadow-2xl overflow-hidden">
      {/* Scrollable Chat History Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-950/50">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <svg
              className="w-12 h-12 text-slate-700"
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
            <p className="text-sm font-medium">
              Database connection stable. Ready for queries.
            </p>
            <p className="text-xs text-slate-600">
              Your results are isolated to {role} documents.
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
                className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-4 text-sm shadow-md ${
                  msg.sender === "user"
                    ? "bg-cyan-900/40 text-cyan-50 border border-cyan-700/50 rounded-br-sm"
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </p>

                {/* Document Citations Rendering */}
                {msg.sources?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-2">
                    <span className="block w-full text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Verified Citations
                    </span>
                    {msg.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900/80 border border-slate-700 px-2 py-1 rounded text-[11px] font-medium text-slate-300 flex items-center gap-1"
                      >
                        📄 {src}
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
            <p className="text-xs text-cyan-400 font-medium animate-pulse bg-cyan-900/20 border border-cyan-900/50 px-4 py-2 rounded-lg">
              Synthesizing contextual vectors...
            </p>
          </div>
        )}
      </div>

      {/* Query Input Form */}
      <form
        onSubmit={handleQuery}
        className="p-4 border-t border-slate-800 bg-slate-900 flex gap-3"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Search the enterprise knowledge base..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3.5 text-sm text-white focus:border-cyan-500 outline-none transition-colors shadow-inner"
        />
        <button
          type="submit"
          disabled={isQuerying || !question.trim()}
          className="bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
        >
          Execute
        </button>
      </form>
    </section>
  );
}
