import { APP_CONFIG } from "@/lib/constants";
import Image from "next/image";
import "./globals.css";

// Updated metadata to point to the correct favicon
export const metadata = {
  title: `${APP_CONFIG.NAME} | Secure Intelligence`,
  description: APP_CONFIG.TAGLINE,
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#0B0E13]" style={{ colorScheme: "dark" }}>
      <head>
        {/* Display face for the dossier headline tone, body face for everything readable,
            mono face for file metadata / role tags / data-like labels */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#0B0E13] text-[#ECE8DC] antialiased min-h-screen flex flex-col"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* faint dossier grid texture across the whole app */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#C8A24A 1px, transparent 1px), linear-gradient(90deg, #C8A24A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Global Top Navbar */}
        <header className="relative z-50 border-b border-[#232934] bg-[#0B0E13]/85 backdrop-blur-md sticky top-0">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            {/* Wax-seal style holder for the logo */}
            <div className="relative w-9 h-9 flex-shrink-0 rounded-full bg-[#12161D] border border-[#C8A24A]/40 flex items-center justify-center p-1.5">
              <Image
                src="/logo.png"
                alt={`${APP_CONFIG.NAME} Logo`}
                fill
                sizes="36px"
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8891A0] font-medium">
                Classified Knowledge Archive
              </p>
            </div>
          </div>
        </header>

        <main className="relative z-0 flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
