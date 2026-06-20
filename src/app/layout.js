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
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 antialiased font-sans min-h-screen flex flex-col">
        {/* Global Top Navbar */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            {/* The Actual Logo Image */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/logo.png"
                alt={`${APP_CONFIG.NAME} Logo`}
                fill
                sizes="32px"
                className="object-contain" // Ensures the logo fits without stretching
                priority // Tells Next.js to load this image instantly
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {APP_CONFIG.NAME}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
