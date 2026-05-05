import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { enforceCsrf } from "@/lib/security/csrf";
import { requestOtpSchema, mtuEmailRegex } from "@/lib/security/validators";
import { isAdminEmail } from "@/lib/auth/admin";
import { otpLimiter } from "@/lib/security/rate-limit";
import { sendOtpEmail } from "@/lib/mail/send-otp";
import { generateOtpCode } from "@/lib/auth/otp";
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
    console.error("[request-otp] CSRF check failed:", message);
    return NextResponse.json(
      { error: "Security check failed. Please refresh the page and try again." },
      { status: 403, headers: corsHeaders(req) }
    );
  }

  // ── 2. Parse & validate body ──────────────────────────────────────────────
  let email: string;
  try {
    const body = await req.json() as unknown;
    const parsed = requestOtpSchema.parse(body);
    email = parsed.email;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[request-otp] Body parse error:", message);
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  const isAdmin = isAdminEmail(email);
  if (!mtuEmailRegex.test(email) && !isAdmin) {
    return NextResponse.json(
      { error: "Only mtu.edu.ng email addresses are allowed." },
      { status: 400, headers: corsHeaders(req) }
    );
  }

  // ── 3. Rate limiting ──────────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    const check = await otpLimiter.limit(`otp:${ip}:${email}`);
    if (!check.success) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429, headers: corsHeaders(req) }
      );
    }
  } catch (err) {
    // Non-fatal: if Redis is down, allow the request to proceed
    console.error("[request-otp] Rate limit check failed (skipping):", err instanceof Error ? err.message : String(err));
  }

  // ── 4. Upsert user & create OTP ───────────────────────────────────────────
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: isAdmin ? { role: "ADMIN" } : {},
      create: {
        email,
        role: isAdmin ? "ADMIN" : "STUDENT"
      }
    });

    const otp = generateOtpCode();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? null
      }
    });

    // ── 5. Send email ─────────────────────────────────────────────────────
    sendOtpEmail(email, otp).catch(err => console.error("[request-otp] Email error:", err));
    return NextResponse.json({ ok: true }, { headers: corsHeaders(req) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[request-otp] Server error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}
