"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { Button, Card } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { setEmail } = useAuthStore();
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    router.prefetch("/verify-otp");
    /** Fetch and cache the CSRF token from the server response body.
     * Avoids relying on document.cookie which fails when cookie was HttpOnly. */
    void fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data: { ok: boolean; token: string }) => {
        if (data.token) setCsrfToken(data.token);
      })
      .catch(() => {
        // Non-fatal: submit will show an error if token is still empty
      });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Use the CSRF token fetched from /api/auth/csrf on mount
    const csrf = csrfToken;
    if (!csrf) {
      setError("Security token not ready. Please wait a moment and try again.");
      setLoading(false);
      return;
    }

    const fullEmail = emailInput.trim().toLowerCase();
    setEmail(fullEmail);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ email: fullEmail })
      });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      router.replace("/verify-otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
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
            whileHover={{ scale: 1.05 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-green/20 rounded-full blur-xl opacity-75" />
              <div className="relative h-36 w-36 flex items-center justify-center">
                <Image 
                  src="/general/src-logo.png" 
                  alt="MTU SRC Logo" 
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </motion.div>
          <h1 className="text-display-lg font-heading font-bold text-primary-green mb-3">
            SRC Student Week Awards '26
          </h1>
          <p className="text-body-lg text-neutral-text-secondary">
            Your Voice Matters. Cast it Now.
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="dark" className="border-primary-purple/50">
            <div className="px-10 py-10">
              <h2 className="text-h2 font-heading font-bold text-neutral-text-primary mb-6 text-center">
                Welcome Back
              </h2>
              <p className="text-body-sm text-neutral-text-secondary mb-10 text-center">
                Enter your MTU email to receive a one-time password
              </p>

              <form className="space-y-5" onSubmit={submit}>
                {/* Email Input */}
                <div>
                  <label className="block text-body-sm font-semibold text-neutral-text-primary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-4 py-3 bg-neutral-card-dark/50 border-2 border-neutral-border rounded-lg focus:outline-none focus:ring-4 focus:ring-primary-purple/25 focus:border-primary-purple transition-all duration-fast text-neutral-text-primary placeholder-neutral-text-secondary" 
                      type="email" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value.toLowerCase().replace(/\s/g, ""))} 
                      placeholder="e.g. user@mtu.edu.ng"
                      required 
                    />
                  </div>
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
                  disabled={loading || !emailInput.trim()}
                >
                  Send OTP
                </Button>
              </form>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 rounded-lg bg-primary-green/10 border border-primary-green/30"
              >
                <p className="text-body-sm text-neutral-text-secondary flex items-start gap-2 m-2 p-2">
                  <span className="text-lg flex-shrink-0">🔐</span>
                  <span> No passwords needed. We'll send a secure OTP to your student mail.</span>
                </p>
              </motion.div>
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
          Secure voting powered by SRC '26 • Your data is protected
        </motion.p>
      </div>
    </motion.div>
  );
}