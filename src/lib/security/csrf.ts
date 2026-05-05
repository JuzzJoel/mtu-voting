/**
 * Stateless CSRF protection using HMAC-signed tokens.
 *
 * Why this approach?
 * - The cookie double-submit pattern requires `httpOnly: false` and client-side
 *   cookie access, which is fragile across browsers and Next.js caching.
 * - A signed token returned in the JSON response body is simpler, more reliable,
 *   and doesn't rely on cookie stores being writable from Route Handlers.
 *
 * Flow:
 *   1. Client fetches GET /api/auth/csrf → receives { token: "<signed>" }
 *   2. Client sends token in X-CSRF-Token header with subsequent POST requests
 *   3. Server verifies HMAC signature of the token
 */

import { NextRequest } from "next/server";
import crypto from "crypto";
import { env } from "@/lib/env";

const CSRF_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generates a CSRF token: `timestamp.hmac(timestamp)`
 * The timestamp ensures tokens expire, the HMAC ensures they can't be forged.
 */
export function generateCsrfToken(): string {
  const ts = Date.now().toString();
  const sig = crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(ts)
    .digest("hex");
  return `${ts}.${sig}`;
}

/**
 * Verifies a CSRF token from the X-CSRF-Token header.
 * Throws an Error if invalid or expired.
 */
export function verifyCsrfToken(token: string | null): void {
  if (!token) throw new Error("Missing CSRF token");

  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("Malformed CSRF token");

  const [ts, sig] = parts as [string, string];
  const expectedSig = crypto
    .createHmac("sha256", env.JWT_SECRET)
    .update(ts)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error("Invalid CSRF signature");
  }

  const age = Date.now() - parseInt(ts, 10);
  if (age > CSRF_TTL_MS) throw new Error("Expired CSRF token");
}

/**
 * Enforces CSRF protection on a POST/mutation request.
 * Also validates the Origin header in production.
 */
export function enforceCsrf(req: NextRequest): void {
  const headerToken = req.headers.get("x-csrf-token");
  verifyCsrfToken(headerToken);

  // Validate origin if present (browsers always send it on cross-origin; same-origin
  // requests may omit it in dev, so we only reject if it's present but wrong).
  const origin = req.headers.get("origin");
  if (origin && origin !== env.APP_ORIGIN) {
    // In development, allow localhost on any port (Next.js can switch ports)
    const isDevLocalhost = env.NODE_ENV === "development" && origin.startsWith("http://localhost:");
    if (!isDevLocalhost) {
      throw new Error("Invalid origin");
    }
  }
}
