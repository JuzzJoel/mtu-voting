import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";

export async function POST(_req: NextRequest) {
  await clearSession();
  return NextResponse.json({ ok: true });
}
