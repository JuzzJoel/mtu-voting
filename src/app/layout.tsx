import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Inter, Geist_Mono } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const geistMono = Geist_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "MTU Student Choice Awards 2026",
  description: "MTU Student Choice Awards 2026 — Vote for your favourites",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
