import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { Redis } from "@upstash/redis";
import nodemailer from "nodemailer";

type ServiceStatus = "ok" | "error";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    promise
      .then((value) => { clearTimeout(timeout); resolve(value); })
      .catch((error) => { clearTimeout(timeout); reject(error); });
  });
}

export async function GET() {
  const redis = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });

  const smtpTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  const [dbCheck, redisCheck, smtpCheck] = await Promise.allSettled([
    withTimeout(prisma.$queryRaw`SELECT 1`, 5000, "database"),
    withTimeout(redis.ping(), 5000, "redis"),
    withTimeout(smtpTransporter.verify(), 5000, "smtp"),
  ]);

  const services: Record<string, { status: ServiceStatus; message?: string }> = {
    app: { status: "ok" },
    database: dbCheck.status === "fulfilled" ? { status: "ok" } : { status: "error", message: String(dbCheck.reason) },
    redis: redisCheck.status === "fulfilled" ? { status: "ok" } : { status: "error", message: String(redisCheck.reason) },
    smtp: smtpCheck.status === "fulfilled" ? { status: "ok" } : { status: "error", message: String(smtpCheck.reason) },
  };

  const overall = Object.values(services).every(s => s.status === "ok") ? "ok" : "degraded";
  return NextResponse.json({ status: overall, timestamp: new Date().toISOString(), services }, { status: overall === "ok" ? 200 : 503 });
}
