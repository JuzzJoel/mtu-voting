"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/auth");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-xs transition-opacity hover:opacity-80 w-full"
      style={{ color: "rgba(255,255,255,0.3)" }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4.5 2H2A1.5 1.5 0 00.5 3.5v5A1.5 1.5 0 002 10h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 3.5L11 6l-3 2.5M11 6H4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Sign out
    </button>
  );
}
