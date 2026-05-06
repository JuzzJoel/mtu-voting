import { NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Enforces CSRF protection by validating the Origin header.
 * For JSON APIs, this is sufficient — browsers always send Origin on cross-origin
 * requests, and Content-Type: application/json triggers a CORS preflight.
 */
export function enforceCsrf(req: NextRequest): void {
  const origin = req.headers.get("origin");
  if (!origin) return; // same-origin request — safe

  if (origin === env.APP_ORIGIN) return;

  if (env.NODE_ENV === "development" && origin.startsWith("http://localhost:")) return;

  throw new Error(`Invalid origin: ${origin}`);
}
