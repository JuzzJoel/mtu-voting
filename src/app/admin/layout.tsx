import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";

const BG = "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)";
const ACCENT = "linear-gradient(135deg, #6366f1, #8b5cf6)";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex relative" style={{ background: BG }}>
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 min-h-screen flex-shrink-0 border-r relative z-10"
        style={{ background: "rgba(0,0,0,0.28)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="px-5 py-5 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/general/src-logo.png" alt="MTU" width={26} height={26} className="object-contain" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">MTU Admin</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Awards 2026</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-3 px-3">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all duration-150 mb-0.5"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            Nominees
          </Link>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs transition-all duration-150"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <polyline points="1,10 4,6 7,8 10,3 13,5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Live Results
          </Link>
        </nav>

        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Admin access only</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <Image src="/general/src-logo.png" alt="MTU" width={22} height={22} className="object-contain" />
        <span className="text-xs font-bold text-white flex-1">MTU Admin</span>
        <Link href="/admin" className="text-xs mr-3 transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>
          Nominees
        </Link>
        <Link href="/admin/dashboard" className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.6)" }}>
          Results
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 relative z-10 pt-16 lg:pt-0">
        <div className="px-5 py-8 max-w-5xl mx-auto lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
