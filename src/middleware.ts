import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const enc = new TextEncoder();

async function verifySession(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, enc.encode(secret));
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const path = req.nextUrl.pathname;

  const isProtected =
    path.startsWith("/vote") ||
    path.startsWith("/success") ||
    path.startsWith("/admin") ||
    path.startsWith("/onboarding");

  if (!isProtected) return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL("/auth", req.url));
  const payload = await verifySession(token);
  if (!payload) return NextResponse.redirect(new URL("/auth", req.url));

  if (path.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/vote", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding/:path*", "/vote/:path*", "/success", "/admin/:path*"],
};
