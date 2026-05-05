import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "MTU Voting",
  description: "Secure student voting application"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">{children}</main>
        <footer className="w-full text-center py-8 relative z-50 border-t border-white/5">
          <p className="text-body-sm text-neutral-text-secondary font-medium">
            Created by <a href="https://github.com/JuzzJoel" target="_blank" rel="noopener noreferrer" className="text-primary-green hover:text-primary-green/80 font-bold transition-colors tracking-wide">AMANI</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
