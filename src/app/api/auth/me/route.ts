import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ authenticated: false });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, isOnboarded: true, role: true }
  });
  if (!user) return NextResponse.json({ authenticated: false });

  return NextResponse.json({ authenticated: true, ...user });
}
