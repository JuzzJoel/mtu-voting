import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { enforceCsrf } from '@/lib/security/csrf'
import { requestOtpSchema, mtuEmailRegex } from '@/lib/security/validators'
import { isAdminEmail } from '@/lib/auth/admin'
import { otpLimiter } from '@/lib/security/rate-limit'
import { sendOtpEmail } from '@/lib/mail/send-otp'
import { generateOtpCode } from '@/lib/auth/otp'
import { corsHeaders, handleOptions } from '@/lib/security/cors'

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req)
}

export async function POST(req: NextRequest) {
  try {
    enforceCsrf(req)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request origin.' },
      { status: 403, headers: corsHeaders(req) }
    )
  }

  // ── 2. Parse & validate body ──────────────────────────────────────────────
  let email: string
  try {
    const body = (await req.json()) as unknown
    const parsed = requestOtpSchema.parse(body)
    email = parsed.email
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[request-otp] Body parse error:', message)
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: corsHeaders(req) }
    )
  }

  // Strip plus-addressing (e.g. user+tag@mtu.edu.ng → user@mtu.edu.ng)
  const [localPart, domain] = email.split('@')
  email = `${localPart.split('+')[0]}@${domain}`

  const isAdmin = isAdminEmail(email)
  if (!mtuEmailRegex.test(email) && !isAdmin) {
    return NextResponse.json(
      { error: 'Only mtu.edu.ng email addresses are allowed.' },
      { status: 400, headers: corsHeaders(req) }
    )
  }

  // Blocklist check — set BLOCKED_EMAILS in env as comma-separated list
  const blocked = (process.env.BLOCKED_EMAILS ?? '')
    .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  if (blocked.includes(email)) {
    return NextResponse.json(
      { error: 'This email address is not permitted to vote.' },
      { status: 403, headers: corsHeaders(req) }
    )
  }

  // ── 3. Rate limiting ──────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  try {
    const check = await otpLimiter.limit(`otp:${ip}:${email}`)
    if (!check.success) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again later.' },
        { status: 429, headers: corsHeaders(req) }
      )
    }
  } catch (err) {
    // Non-fatal: if Redis is down, allow the request to proceed
    console.error(
      '[request-otp] Rate limit check failed (skipping):',
      err instanceof Error ? err.message : String(err)
    )
  }

  // ── 4. Upsert user & create OTP ───────────────────────────────────────────
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: isAdmin ? { role: 'ADMIN' } : {},
      create: {
        email,
        role: isAdmin ? 'ADMIN' : 'STUDENT',
      },
    })

    // Invalidate any previous unused OTPs for this user
    await prisma.otpCode.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const otp = generateOtpCode()
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
        ipAddress: ip,
        userAgent: req.headers.get('user-agent') ?? null,
      },
    })

    // ── 5. Send email ─────────────────────────────────────────────────────
    try {
      await sendOtpEmail(email, otp)
    } catch (err) {
      console.error('[request-otp] Email error:', err instanceof Error ? err.message : String(err))
      return NextResponse.json(
        { error: 'We could not send the email. Please check your address and try again.' },
        { status: 502, headers: corsHeaders(req) }
      )
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders(req) })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[request-otp] Server error:', message)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500, headers: corsHeaders(req) }
    )
  }
}
