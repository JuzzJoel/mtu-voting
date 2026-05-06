import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MTU Voting",
  description: "MTU Student Choice Awards 2026",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-gray-50">
        <Providers>
          <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 bg-white/90 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
            <Link href="/auth" className="flex items-center gap-3">
              <Image
                src="/general/src-logo.png"
                alt="MTU"
                width={36}
                height={36}
                className="object-contain"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-black leading-tight">Mountain Top University</p>
                <p className="text-xs text-gray-500 leading-tight">Student Choice Awards 2026</p>
              </div>
            </Link>
          </header>
          <main className="min-h-screen pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
