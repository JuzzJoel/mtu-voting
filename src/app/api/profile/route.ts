import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/guards";
import { onboardingSchema } from "@/lib/security/validators";
import { enforceCsrf } from "@/lib/security/csrf";

export async function POST(req: NextRequest) {
  try {
    await enforceCsrf(req);
    const user = await requireUser(req);
    const payload = onboardingSchema.parse(await req.json());

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { ...payload, isOnboarded: true },
      select: { role: true }
    });
    
    const nextRoute = updatedUser.role === "ADMIN" ? "/admin/dashboard" : "/vote";
    return NextResponse.json({ ok: true, nextRoute });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
