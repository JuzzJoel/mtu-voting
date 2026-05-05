"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button, Card, OTPInput } from "../ui";

export interface OTPFormProps {
  email: string;
  onSubmit: (otp: string) => Promise<void>;
  onBack?: () => void;
}

export const OTPForm: React.FC<OTPFormProps> = ({ email, onSubmit, onBack }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card variant="dark" className="border-primary-purple/50">
        <div className="px-6 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              📬
            </motion.div>
            <h2 className="text-h2 font-bold mb-2">Verify Your Identity</h2>
            <p className="text-neutral-text-secondary text-sm">
              Enter the 6-digit code sent to{" "}
              <span className="font-semibold text-primary-green">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="py-6">
              <OTPInput
                length={6}
                onComplete={(value: string) => setOtp(value)}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/50"
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
              disabled={!otp || otp.length !== 6}
            >
              Verify OTP
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            {resendCountdown > 0 ? (
              <p className="text-center text-body-sm text-neutral-text-secondary">
                Resend code in <span className="text-primary-green font-bold">{resendCountdown}s</span>
              </p>
            ) : (
              <button
                onClick={() => setResendCountdown(60)}
                className="w-full text-body-sm text-primary-green hover:text-primary-green/80 font-semibold transition-colors"
              >
                Didn't receive code? Resend
              </button>
            )}

            {onBack && (
              <button
                onClick={onBack}
                className="w-full text-body-sm text-neutral-text-secondary hover:text-neutral-text-primary transition-colors"
              >
                ← Back to Login
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
