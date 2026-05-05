import Link from "next/link";
import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-neutral-surface-dark border-r border-white/5 px-6 py-8 hidden lg:flex flex-col">
        <div className="text-xl font-semibold text-white mb-10">MTU Admin</div>
        <nav className="space-y-3 text-body-sm">
          <Link className="text-neutral-text-secondary hover:text-white" href="/admin">
            Nominee Manager
          </Link>
          <Link className="text-neutral-text-secondary hover:text-white" href="/admin/dashboard">
            Live Results
          </Link>
        </nav>
        <div className="mt-auto text-caption text-neutral-text-secondary">
          Access restricted to whitelisted emails.
        </div>
      </aside>
      <div className="flex-1 min-h-screen bg-neutral-bg-dark">
        <div className="lg:hidden px-6 py-4 border-b border-white/5 text-white font-semibold">
          MTU Admin
        </div>
        <div className="px-6 py-10 max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
