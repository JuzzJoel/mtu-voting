import { NextRequest, NextResponse } from "next/server";

export function corsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  
  // In development, allow localhost on any port (Next.js can switch ports)
  const isDevLocalhost = process.env.NODE_ENV === "development" && origin.startsWith("http://localhost:");
  const isAllowed = origin === allowedOrigin || isDevLocalhost;

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token, Authorization",
    "Vary": "Origin"
  };
}

export function handleOptions(req: NextRequest): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}
