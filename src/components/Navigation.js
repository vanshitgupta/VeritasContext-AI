// src/components/Navigation.js
"use client";

import { APP_CONFIG } from "../lib/constants";
import Image from "next/image";

export default function Navigation({ role, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0E13]/90 backdrop-blur-md border-b border-[#232934]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-full bg-[#12161D] border border-[#C8A24A]/40 flex items-center justify-center p-1.5">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              sizes="40px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <h1
              className="text-xl font-semibold tracking-tight text-[#ECE8DC]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {APP_CONFIG.NAME}
            </h1>
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C8A24A]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {role} · Workspace
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="End session and return to Auth Gate"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#12161D] hover:bg-[#181D26] text-[#ECE8DC] rounded-md transition-all border border-[#232934] hover:border-[#C8A24A]/50 text-xs font-bold uppercase tracking-[0.1em]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
          Lock Session
        </button>
      </div>
    </header>
  );
}
