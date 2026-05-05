import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
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
          <main className="min-h-screen">{children}</main>
          <footer className="w-full text-center py-10 relative z-50 border-t border-white/5">
            <p className="text-body-sm text-neutral-text-secondary font-medium">
              Mountain Top University • Secure Voting Experience
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
