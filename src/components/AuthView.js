// // src/components/AuthView.js
// "use client";

// import { useState } from "react";
// import { SYSTEM_ROLES } from "../lib/constants";

// /**
//  * Authentication View Gateway
//  * Prevents unauthorized access. It sends the selected role and passcode to the backend
//  * route (/api/auth) which verifies it against the .env.local file.
//  */
// export default function AuthView({ onLogin }) {
//   const [role, setRole] = useState(SYSTEM_ROLES.GENERAL);
//   const [passcode, setPasscode] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   // Executes the login request
//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const res = await fetch("/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ role, passcode }),
//       });

//       const data = await res.json();

//       // If successful, pass the role back up to page.js to unlock the UI
//       if (res.ok) {
//         onLogin(data.role);
//       } else {
//         setError(data.error || "Access Denied. Invalid Passcode.");
//       }
//     } catch (err) {
//       setError("Network execution failed. Please check your connection.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-12 md:mt-24 bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-2xl">
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold text-white mb-2">
//           Secure Login Gateway
//         </h2>
//         <p className="text-sm text-slate-400">
//           Select your departmental role and enter your passcode.
//         </p>
//       </div>

//       <form onSubmit={handleAuth} className="space-y-5">
//         {/* Role Selection Dropdown */}
//         <div>
//           <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
//             Access Role
//           </label>
//           <select
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
//           >
//             {Object.values(SYSTEM_ROLES).map((r) => (
//               <option key={r} value={r}>
//                 {r}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Passcode Input */}
//         <div>
//           <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
//             Passcode
//           </label>
//           <input
//             type="password"
//             value={passcode}
//             onChange={(e) => setPasscode(e.target.value)}
//             placeholder="Enter secure passcode"
//             className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
//             required
//           />
//         </div>

//         {/* Error Display Block */}
//         {error && (
//           <p className="text-red-400 text-xs font-medium bg-red-900/20 p-3 rounded-lg border border-red-900/50">
//             {error}
//           </p>
//         )}

//         <button
//           type="submit"
//           disabled={isLoading || !passcode}
//           className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-cyan-900/20"
//         >
//           {isLoading ? "Verifying Identity..." : "Authenticate Session"}
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { SYSTEM_ROLES } from "../lib/constants";

/**
 * Authentication View Gateway
 * Prevents unauthorized access. It sends the selected role and passcode to the backend
 * route (/api/auth) which verifies it against the .env.local file.
 */
export default function AuthView({ onLogin }) {
  const [role, setRole] = useState(SYSTEM_ROLES.GENERAL);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Executes the login request
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, passcode }),
      });

      const data = await res.json();

      // If successful, pass the role back up to page.js to unlock the UI
      if (res.ok) {
        onLogin(data.role);
      } else {
        setError(data.error || "Access Denied. Invalid Passcode.");
      }
    } catch (err) {
      setError("Network execution failed. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E13] px-4">
      <div className="w-full max-w-md relative mt-[-2rem]">
        {/* Stamped clearance badge, the signature element of the gate */}
        <div className="absolute -top-5 right-6 z-10 rotate-[6deg] select-none">
          <div className="border-2 border-[#C8A24A] text-[#C8A24A] text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-sm bg-[#0B0E13]">
            Clearance Required
          </div>
        </div>

        <div className="bg-[#12161D] rounded-lg border border-[#232934] shadow-2xl shadow-black/40 overflow-hidden">
          {/* Dossier tab header strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#C8A24A] via-[#E3C988] to-[#C8A24A]" />

          <div className="p-7 md:p-9">
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C8A24A] font-semibold mb-2">
                File Access Gateway
              </p>
              <h2
                className="text-2xl font-semibold text-[#ECE8DC]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Identify Yourself
              </h2>
              <p className="text-sm text-[#8891A0] mt-2">
                Select your departmental role and enter your passcode to
                proceed.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {/* Role Selection Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8891A0] mb-2">
                  Access Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0B0E13] border border-[#232934] rounded-md px-4 py-3 text-sm text-[#ECE8DC] focus:border-[#C8A24A] outline-none transition-colors font-mono"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {Object.values(SYSTEM_ROLES).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Passcode Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8891A0] mb-2">
                  Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0E13] border border-[#232934] rounded-md px-4 py-3 text-sm text-[#ECE8DC] placeholder:text-[#4B5363] focus:border-[#C8A24A] outline-none transition-colors font-mono"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  required
                />
              </div>

              {/* Error Display Block */}
              {error && (
                <p className="text-[#E08877] text-xs font-medium bg-[#C1503F]/10 p-3 rounded-md border border-[#C1503F]/40">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !passcode}
                className="w-full bg-[#C8A24A] hover:bg-[#E3C988] disabled:opacity-40 disabled:hover:bg-[#C8A24A] text-[#0B0E13] font-bold py-3 rounded-md text-sm uppercase tracking-[0.1em] transition-all"
              >
                {isLoading ? "Verifying Identity…" : "Authenticate Session"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#4B5363] mt-5">
          All access attempts are logged
        </p>
      </div>
    </div>
  );
}
