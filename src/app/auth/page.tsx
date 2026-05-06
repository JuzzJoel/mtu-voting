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
    if (!storedEmail) setStep("email");
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
      body: JSON.stringify({ email }),
    });
  };

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setInfoMessage(neutralMessage);

    if (!isEmailValid) {
      setError("Use your MTU email address (e.g. name@mtu.edu.ng).");
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
        body: JSON.stringify({ email: storedEmail, otp }),
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
      if (!res.ok) setError("We could not resend the code. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/general/src-logo.png"
            alt="MTU"
            width={72}
            height={72}
            className="object-contain mb-4"
          />
          <h1 className="text-base font-bold text-black text-center">Student Choice Awards 2026</h1>
          <p className="text-xs text-gray-500 mt-1 text-center">Mountain Top University</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 bg-white">
          {/* Step indicator */}
          <div className="flex items-center px-6 pt-6 pb-5 border-b border-gray-100">
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === "email" ? "text-black" : "text-gray-400"}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold border ${step === "email" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                1
              </span>
              Email
            </div>
            <div className={`flex-1 mx-3 h-px ${step === "otp" ? "bg-black" : "bg-gray-200"}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold ${step === "otp" ? "text-black" : "text-gray-400"}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold border ${step === "otp" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-gray-400"}`}>
                2
              </span>
              Verify
            </div>
          </div>

          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.form
                  key="email"
                  onSubmit={requestOtp}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      MTU Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="you@mtu.edu.ng"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="w-full border border-gray-300 px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {infoMessage && (
                    <p className="text-xs text-gray-500">{infoMessage}</p>
                  )}

                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!isEmailValid || loading}
                    isLoading={loading}
                  >
                    Send Verification Code
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-black mb-1">Enter the 6-digit code</p>
                    <p className="text-xs text-gray-500">
                      Sent to <span className="font-semibold text-black">{storedEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={verifyOtp} className="space-y-4">
                    <div className="py-2">
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
                      <p className="text-xs text-red-600">{error}</p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={otp.length !== 6 || otpLoading}
                      isLoading={otpLoading}
                    >
                      Verify & Continue
                    </Button>
                  </form>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <button type="button" onClick={() => setStep("email")} className="hover:text-black underline underline-offset-2">
                      Change email
                    </button>
                    <button type="button" onClick={resendOtp} className="hover:text-black underline underline-offset-2">
                      Resend code
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
