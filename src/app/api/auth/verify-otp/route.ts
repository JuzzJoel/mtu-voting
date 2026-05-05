import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { enforceCsrf } from "@/lib/security/csrf";
import { verifyOtpSchema } from "@/lib/security/validators";
import { createSession } from "@/lib/auth/session";
import { corsHeaders, handleOptions } from "@/lib/security/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  // ── 1. CSRF verification ──────────────────────────────────────────────────
  try {
    enforceCsrf(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[verify-otp] CSRF check failed:", message);
    return NextResponse.json(
      { error: "Security check failed. Please refresh the page and try again." },
      { status: 403, headers: corsHeaders(req) }
    );
  }

  // ── 2. Parse & validate body ──────────────────────────────────────────────
  let email: string;
  let otp: string;
  try {
    const body = await req.json() as unknown;
    const parsed = verifyOtpSchema.parse(body);
    email = parsed.email;
    otp = parsed.otp;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[verify-otp] Body parse error:", message);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // ── 3. OTP verification & session creation ────────────────────────────────
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400, headers: corsHeaders(req) });
    }

    const latestOtp = await prisma.otpCode.findFirst({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" }
    });
    if (!latestOtp) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400, headers: corsHeaders(req) });
    }

    const hashToVerify = crypto.createHash("sha256").update(otp).digest("hex");
    const matches = latestOtp.otpHash === hashToVerify;
    if (!matches) {
      await prisma.otpCode.update({
        where: { id: latestOtp.id },
        data: { attempts: { increment: 1 } }
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400, headers: corsHeaders(req) });
    }

    await prisma.otpCode.update({
      where: { id: latestOtp.id },
      data: { usedAt: new Date() }
    });

    await createSession({ userId: user.id, email: user.email, role: user.role });

    let nextRoute = "/onboarding";
    if (user.isOnboarded) {
      nextRoute = user.role === "ADMIN" ? "/admin/dashboard" : "/vote";
    }

    return NextResponse.json(
      { ok: true, nextRoute },
      { headers: corsHeaders(req) }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[verify-otp] Server error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
