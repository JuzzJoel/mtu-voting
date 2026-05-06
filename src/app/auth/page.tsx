"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, OTPInput } from "@/components/ui";
import { mtuEmailRegex } from "@/lib/security/validators";
import { useAuthStore } from "@/stores/auth-store";

const neutralMessage = "If this email is valid, a verification code has been sent.";
type Step = "email" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const { email: storedEmail, setEmail } = useAuthStore();
  const [step, setStep] = useState<Step>("email");
  const [emailInput, setEmailInput] = useState(storedEmail ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [touched, setTouched] = useState(false);

  const isEmailValid = useMemo(() => mtuEmailRegex.test(emailInput.trim().toLowerCase()), [emailInput]);
  const isEmailSubmittable = useMemo(() => emailInput.trim().includes("@") && emailInput.trim().includes("."), [emailInput]);
  const showEmailError = touched && emailInput.trim().length > 0 && !isEmailValid && !error;

  useEffect(() => {
    void fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d: { token?: string }) => { if (d.token) setCsrfToken(d.token); })
      .catch(() => null);
  }, []);

  useEffect(() => { if (!storedEmail) setStep("email"); }, [storedEmail]);

  const ensureCsrf = async () => {
    if (csrfToken) return csrfToken;
    const r = await fetch("/api/auth/csrf");
    const d = (await r.json()) as { token?: string };
    if (d.token) { setCsrfToken(d.token); return d.token; }
    return "";
  };

  const sendOtp = async (email: string) => {
    const csrf = await ensureCsrf();
    if (!csrf) throw new Error("Missing CSRF");
    return fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
      body: JSON.stringify({ email }),
    });
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setTouched(true);
    if (!isEmailSubmittable) return;
    setLoading(true);
    const email = emailInput.trim().toLowerCase();
    setEmail(email);
    try {
      const res = await sendOtp(email);
      if (!res.ok) { setError("We could not send the code. Please try again."); return; }
      setInfoMessage(neutralMessage);
      setCsrfToken(""); // force fresh token for verify-otp
      setStep("otp");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (event?: FormEvent, otpOverride?: string) => {
    event?.preventDefault();
    const otpValue = otpOverride ?? otp;
    if (!otpValue || otpValue.length !== 6) return;
    setError("");
    setOtpLoading(true);
    try {
      const csrf = await ensureCsrf();
      if (!csrf) throw new Error("Missing CSRF");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ email: storedEmail, otp: otpValue }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; nextRoute?: string };
      if (!res.ok) { setError(data.error ?? "Invalid verification code."); return; }
      router.replace((data.nextRoute ?? "/vote") as Parameters<typeof router.replace>[0]);
    } catch { setError("Network error. Please try again."); }
    finally { setOtpLoading(false); }
  };

  const resendOtp = async () => {
    if (!storedEmail) return;
    setError("");
    try {
      const res = await sendOtp(storedEmail);
      if (!res.ok) setError("We could not resend the code.");
      else { setInfoMessage(neutralMessage); setCsrfToken(""); }
    } catch { setError("Network error. Please try again."); }
  };

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
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
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
                      onChange={(e) => { setEmailInput(e.target.value); setTouched(true); setError(""); }}
                      required
                      className={`w-full border rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 transition-all duration-150 ${
                        showEmailError
                          ? "border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400"
                          : "border-gray-200 bg-gray-50 focus:ring-indigo-100 focus:border-indigo-400 focus:bg-white"
                      }`}
                    />
                    <AnimatePresence>
                      {showEmailError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 flex items-center gap-1 pt-0.5"
                        >
                          Please use your MTU email (@mtu.edu.ng)
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {infoMessage && (
                    <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2.5 rounded-lg">{infoMessage}</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full !rounded-lg"
                    style={{ background: "linear-gradient(135deg, #302b63, #6366f1)", border: "none", color: "white" } as React.CSSProperties}
                    disabled={!isEmailSubmittable || loading}
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
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

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <button type="button" onClick={() => setStep("email")} className="hover:text-gray-900 transition-colors">
                      ← Change email
                    </button>
                    <button type="button" onClick={resendOtp} className="hover:text-gray-900 transition-colors">
                      Resend code
                    </button>
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
