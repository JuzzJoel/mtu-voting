import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-52 bg-white border-r border-gray-200 px-5 py-6 hidden lg:flex flex-col flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 mb-8">
          <Image src="/general/src-logo.png" alt="MTU" width={28} height={28} className="object-contain" />
          <span className="text-xs font-bold text-black">MTU Admin</span>
        </Link>
        <nav className="space-y-0.5 text-xs">
          <Link className="block py-2 px-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" href="/admin">
            Nominee Manager
          </Link>
          <Link className="block py-2 px-2 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors" href="/admin/dashboard">
            Live Results
          </Link>
        </nav>
        <div className="mt-auto text-xs text-gray-400">Access restricted</div>
      </aside>

      <div className="flex-1 min-h-screen bg-white">
        <div className="lg:hidden px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <Image src="/general/src-logo.png" alt="MTU" width={24} height={24} className="object-contain" />
          <span className="text-xs font-bold text-black">MTU Admin</span>
          <span className="ml-auto text-xs text-gray-500">
            <Link href="/admin" className="mr-4 hover:text-black">Nominees</Link>
            <Link href="/admin/dashboard" className="hover:text-black">Results</Link>
          </span>
        </div>
        <div className="px-5 py-8 max-w-5xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
