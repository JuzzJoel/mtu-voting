"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Button, Card, OTPInput } from "@/components/ui";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { email } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Prefetch possible next routes to eliminate lag on successful OTP
  useEffect(() => {
    router.prefetch("/onboarding");
    router.prefetch("/vote");
    router.prefetch("/admin/dashboard");
  }, [router]);

  // Redirect to login if email is lost from state (e.g., page refresh)
  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Fetch a fresh CSRF token from the server for this request
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json() as { ok: boolean; token: string };
      const csrf = csrfData.token;

      if (!csrf) {
        setError("Security check failed. Please refresh and try again.");
        return;
      }

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json() as { ok?: boolean; error?: string; nextRoute?: string };
      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        return;
      }
      router.replace((data.nextRoute ?? "/") as Parameters<typeof router.replace>[0]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (resendLoading) return;
    if (!email) {
      setError("Session expired. Redirecting to login...");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }
    setResendLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json() as { ok: boolean; token: string };
      const csrf = csrfData.token;

      if (!csrf) {
        setError("Security check failed.");
        return;
      }

      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ email })
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to resend OTP. Please try again.");
        return;
      }
      setResendSuccess(true);
      setOtp("");
      setResetKey(prev => prev + 1);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="w-full max-w-md">
        {/* Animated Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-purple/20 rounded-xl blur-xl opacity-75" />
              <div className="relative h-16 w-16 rounded-xl bg-primary-purple flex items-center justify-center text-white text-3xl">
                📬
              </div>
            </div>
          </motion.div>
          <h1 className="text-display-lg font-heading font-bold text-neutral-text-primary mb-2">
            Verify Your Email
          </h1>
          <p className="text-body-lg text-neutral-text-secondary">
            We sent a 6-digit code to <span className="text-primary-green font-semibold">{email}</span>
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="dark" className="border-primary-purple/50">
            <div className="px-6 py-8 relative">
              {/* Loading Overlay */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-card-dark/90 backdrop-blur-sm rounded-lg"
                >
                  <div className="w-16 h-16 border-4 border-primary-green/30 border-t-primary-green rounded-full animate-spin mb-4" />
                  <p className="text-primary-green font-semibold text-lg animate-pulse">Verifying Code...</p>
                </motion.div>
              )}

              <h2 className="text-h2 font-heading font-bold text-neutral-text-primary mb-2">
                Enter Code
              </h2>
              <p className="text-body-sm text-neutral-text-secondary mb-8">
                Check your email for the verification code
              </p>

              <form className="space-y-6" onSubmit={submit}>
                {/* OTP Input */}
                <div className="py-8 flex justify-center">
                  <OTPInput
                    key={resetKey}
                    length={6}
                    onComplete={(value) => {
                      setOtp(value);
                      // Auto-submit when all digits are entered
                      setTimeout(() => {
                        const form = document.querySelector("form");
                        if (form) form.dispatchEvent(new Event("submit", { bubbles: true }));
                      }, 300);
                    }}
                    disabled={loading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-accent-red/10 border border-accent-red/50"
                  >
                    <p className="text-accent-red text-body-sm font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 space-y-3 text-center">
                <p className="text-body-sm text-neutral-text-secondary">
                  Didn't receive the code?
                </p>
                <button 
                  type="button"
                  onClick={resend}
                  disabled={resendLoading}
                  className="text-primary-green hover:text-primary-green/80 font-semibold text-body-sm transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
                {resendSuccess && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-primary-green text-caption mt-2 font-medium"
                  >
                    A new code has been sent!
                  </motion.p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-caption text-neutral-text-secondary mt-8"
        >
          2-step verification keeps your vote secure
        </motion.p>
      </div>
    </motion.div>
  );
}
