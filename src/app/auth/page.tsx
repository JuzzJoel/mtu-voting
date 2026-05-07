"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, OTPInput } from "@/components/ui";
import { mtuEmailRegex } from "@/lib/security/validators";
import { useAuthStore } from "@/stores/auth-store";

const BASIC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Step = "email" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const { email: storedEmail, setEmail } = useAuthStore();
  const [step, setStep] = useState<Step>("email");
  const [emailInput, setEmailInput] = useState(storedEmail ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isMtuEmail = useMemo(() => mtuEmailRegex.test(emailInput.trim().toLowerCase()), [emailInput]);
  const isBasicEmail = useMemo(() => BASIC_EMAIL_RE.test(emailInput.trim()), [emailInput]);
  // Warn about non-MTU emails only when the email is otherwise syntactically valid
  const showMtuWarning = isBasicEmail && !isMtuEmail && !error;

  useEffect(() => { if (!storedEmail) setStep("email"); }, [storedEmail]);

  const post = (url: string, body: Record<string, string>) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isBasicEmail) return;
    setLoading(true);
    const email = emailInput.trim().toLowerCase();
    setEmail(email);
    try {
      const res = await post("/api/auth/request-otp", { email });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to send code. Please try again.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event?: FormEvent, otpOverride?: string) => {
    event?.preventDefault();
    const otpValue = otpOverride ?? otp;
    if (!otpValue || otpValue.length !== 6) return;
    setError("");
    setOtpLoading(true);
    try {
      const res = await post("/api/auth/verify-otp", { email: storedEmail ?? "", otp: otpValue });
      const data = (await res.json()) as { ok?: boolean; error?: string; nextRoute?: string };
      if (!res.ok) {
        setError(data.error ?? "Invalid verification code.");
        return;
      }
      router.replace((data.nextRoute ?? "/vote") as Parameters<typeof router.replace>[0]);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!storedEmail || resendStatus === "sending") return;
    setError("");
    setResendStatus("sending");
    try {
      const res = await post("/api/auth/request-otp", { email: storedEmail });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setResendStatus("error");
        setError(data.error ?? "Failed to resend code.");
      } else {
        setResendStatus("sent");
        setTimeout(() => setResendStatus("idle"), 5000);
      }
    } catch {
      setResendStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-18 h-18 mb-5"
          >
            <Image src="/general/src-logo.png" alt="MTU" width={72} height={72} className="object-contain drop-shadow-lg" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Choice Awards</h1>
            <p className="text-sm text-white/50 mt-1">Mountain Top University · 2026</p>
          </motion.div>
        </div>

        {/* White card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)" }}
        >
          {/* Step bar */}
          <div className="flex items-center px-6 py-4 pt-6 border-b border-gray-100">
            <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${step === "email" ? "text-gray-900" : "text-gray-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === "email" ? "bg-gray-900 text-white" : "bg-green-500 text-white"}`}>
                {step === "otp" ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : "1"}
              </span>
              Email
            </div>
            <div className="flex-1 mx-3 h-0.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #302b63, #6366f1)" }}
                initial={{ width: "0%" }}
                animate={{ width: step === "otp" ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${step === "otp" ? "text-gray-900" : "text-gray-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${step === "otp" ? "bg-gray-900 text-white border-transparent" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                2
              </span>
              Verify
            </div>
          </div>

          <div className="px-7 py-7">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.form
                  key="email"
                  onSubmit={requestOtp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Sign in to vote</p>
                    <p className="text-sm text-gray-500">Enter your MTU email to receive a one-time code.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      MTU Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@mtu.edu.ng"
                      value={emailInput}
                      onChange={(e) => { setEmailInput(e.target.value); setError(""); }}
                      required
                      className={`w-full border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all duration-150 ${
                        showMtuWarning || error
                          ? "border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400"
                          : "border-gray-200 bg-gray-50 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white"
                      }`}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {(error || showMtuWarning) && (
                      <motion.p
                        key={error || "warning"}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg"
                      >
                        {error || "Please use your MTU email address (@mtu.edu.ng)"}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full !rounded-lg"
                    style={{ background: "linear-gradient(135deg, #302b63, #6366f1)", border: "none", color: "white" } as React.CSSProperties}
                    disabled={!isBasicEmail || loading}
                    isLoading={loading}
                  >
                    Send Verification Code
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">Check your inbox</p>
                    <p className="text-sm text-gray-500">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-gray-900">{storedEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={verifyOtp} className="space-y-5">
                    <div className="py-1">
                      <OTPInput
                        length={6}
                        onComplete={(value) => { setOtp(value); void verifyOtp(undefined, value); }}
                        disabled={otpLoading}
                      />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg text-center"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full !rounded-lg"
                      style={{ background: "linear-gradient(135deg, #302b63, #6366f1)", border: "none", color: "white" } as React.CSSProperties}
                      disabled={otp.length !== 6 || otpLoading}
                      isLoading={otpLoading}
                    >
                      Verify & Continue
                    </Button>
                  </form>

                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <button type="button" onClick={() => setStep("email")} className="hover:text-gray-900 transition-colors">
                        ← Change email
                      </button>
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={resendStatus === "sending" || resendStatus === "sent"}
                        className="hover:text-gray-900 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {resendStatus === "sending" ? "Sending…" : resendStatus === "sent" ? "Sent ✓" : "Resend code"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {resendStatus === "sent" && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2 text-center"
                        >
                          A new code has been sent to {storedEmail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-white/30 mt-6"
        >
          Only @mtu.edu.ng email addresses are permitted.
        </motion.p>
      </motion.div>
    </div>
  );
}
