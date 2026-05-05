import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security/csrf";

/**
 * GET /api/auth/csrf
 * Returns a short-lived, HMAC-signed CSRF token.
 * The client must include this in the X-CSRF-Token header for all POST/mutation requests.
 */
export async function GET() {
  const token = generateCsrfToken();
  return NextResponse.json({ ok: true, token });
}
