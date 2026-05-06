"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, Card, Input, OTPInput } from "@/components/ui";
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

  const isEmailValid = useMemo(() => mtuEmailRegex.test(emailInput.trim().toLowerCase()), [emailInput]);

  useEffect(() => {
    void fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data: { token?: string }) => {
        if (data.token) setCsrfToken(data.token);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!storedEmail) {
      setStep("email");
    }
  }, [storedEmail]);

  const ensureCsrf = async () => {
    if (csrfToken) return csrfToken;
    const res = await fetch("/api/auth/csrf");
    const data = (await res.json()) as { token?: string };
    if (data.token) {
      setCsrfToken(data.token);
      return data.token;
    }
    return "";
  };

  const sendOtp = async (email: string) => {
    const csrf = await ensureCsrf();
    if (!csrf) throw new Error("Missing CSRF");
    return fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
      body: JSON.stringify({ email })
    });
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfoMessage(neutralMessage);

    if (!isEmailValid) {
      setError("Use your MTU email address (e.g. name@mtu.edu.ng). ");
      return;
    }

    setLoading(true);
    const email = emailInput.trim().toLowerCase();
    setEmail(email);

    try {
      const res = await sendOtp(email);
      if (!res.ok) {
        setError("We could not send the code. Please try again.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    setError("");
    setOtpLoading(true);

    try {
      const csrf = await ensureCsrf();
      if (!csrf) throw new Error("Missing CSRF");
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ email: storedEmail, otp })
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; nextRoute?: string };
      if (!res.ok) {
        setError(data.error ?? "Invalid verification code.");
        return;
      }
      router.replace((data.nextRoute ?? "/vote") as Parameters<typeof router.replace>[0]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!storedEmail) return;
    setInfoMessage(neutralMessage);
    setError("");
    try {
      const res = await sendOtp(storedEmail);
      if (!res.ok) {
        setError("We could not resend the code. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-body-sm text-neutral-text-secondary">
            MTU Secure Access
          </div>
          <h1 className="mt-5 text-display-lg text-white">Student Authentication</h1>
          <p className="mt-3 text-body-lg text-neutral-text-secondary">
            Verify your MTU email to access the premium voting experience.
          </p>
        </motion.div>

        <Card variant="glass" className="p-6 md:p-10">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center gap-2 text-body-sm font-medium transition-colors ${step === "email" ? "text-white" : "text-neutral-text-secondary"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-caption font-bold border transition-colors ${
                step === "email"
                  ? "border-primary-green bg-primary-green/10 text-primary-green"
                  : "border-primary-green/30 bg-primary-green/5 text-primary-green/70"
              }`}>1</span>
              Email
            </div>
            <div className={`flex-1 h-px transition-colors ${step === "otp" ? "bg-primary-green/30" : "bg-white/[0.08]"}`} />
            <div className={`flex items-center gap-2 text-body-sm font-medium transition-colors ${step === "otp" ? "text-white" : "text-neutral-text-secondary"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-caption font-bold border transition-colors ${
                step === "otp"
                  ? "border-primary-green bg-primary-green/10 text-primary-green"
                  : "border-white/[0.1] text-neutral-text-secondary"
              }`}>2</span>
              Verify
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form
                key="email"
                onSubmit={requestOtp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <Input
                  label="MTU Email Address"
                  type="email"
                  placeholder="you@mtu.edu.ng"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  required
                />

                {infoMessage && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-body-sm text-neutral-text-secondary">
                    {infoMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-accent-red/30 bg-accent-red/10 p-4 text-body-sm text-accent-red">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={!isEmailValid || loading} isLoading={loading}>
                  Send Verification Code
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-h2 text-white mb-2">Enter the code</h2>
                  <p className="text-body-sm text-neutral-text-secondary">
                    We sent a 6-digit code to <span className="text-white font-semibold">{storedEmail}</span>.
                  </p>
                </div>

                <form onSubmit={verifyOtp} className="space-y-6">
                  <div className="py-4">
                    <OTPInput
                      length={6}
                      onComplete={(value) => {
                        setOtp(value);
                        void verifyOtp();
                      }}
                      disabled={otpLoading}
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-accent-red/30 bg-accent-red/10 p-4 text-body-sm text-accent-red">
                      {error}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={otp.length !== 6 || otpLoading} isLoading={otpLoading}>
                    Verify & Continue
                  </Button>
                </form>

                <div className="flex items-center justify-between text-body-sm text-neutral-text-secondary">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-white hover:text-primary-green"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-white hover:text-primary-green"
                  >
                    Resend code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
