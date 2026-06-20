// src/components/Navigation.js
"use client";

import { APP_CONFIG } from "../lib/constants";
import Image from "next/image";

export default function Navigation({ role, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-900/30 shadow-lg shadow-cyan-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            {/* FIXED: Added the 'sizes' prop to resolve the Next.js warning */}
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              {APP_CONFIG.NAME}
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">
              {role} Workspace
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="End session and return to Auth Gate"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 hover:border-slate-500 text-sm font-bold shadow-sm"
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
