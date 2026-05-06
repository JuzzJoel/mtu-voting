import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MTU Voting",
  description: "Secure student voting application"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 backdrop-blur-glass bg-neutral-bg-dark/75 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-green to-primary-purple flex items-center justify-center text-white text-xs font-bold shadow-glow-green group-hover:shadow-glow-purple transition-shadow duration-300">
                M
              </span>
              <span className="text-white font-semibold text-body-md tracking-tight">
                MTU<span className="text-primary-green">Vote</span>
              </span>
            </Link>
            <span className="text-caption text-neutral-text-secondary hidden sm:block">
              Student Choice Awards 2026
            </span>
          </header>

          <main className="min-h-screen pt-16">{children}</main>

          <footer className="w-full border-t border-white/[0.06] py-8">
            <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="w-5 h-5 rounded bg-gradient-to-br from-primary-green to-primary-purple flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>M</span>
                <span className="text-white font-semibold text-body-sm">MTU<span className="text-primary-green">Vote</span></span>
              </Link>
              <p className="text-body-sm text-neutral-text-secondary">Mountain Top University · Secure Voting Experience</p>
              <p className="text-caption text-neutral-text-secondary">© 2026 MTU</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
