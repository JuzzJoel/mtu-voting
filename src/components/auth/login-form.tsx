"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Card } from "../ui";

export interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
            <h2 className="text-h2 font-bold mb-2">Welcome Back</h2>
            <p className="text-neutral-text-secondary">
              Enter your MTU email to continue voting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your.email@mtu.edu"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              error={error}
              disabled={loading}
              label="Email Address"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Send OTP
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-lg bg-primary-green/10 border border-primary-green/30">
            <p className="text-body-sm text-neutral-text-secondary">
              📧 We'll send a one-time password to your email. No password needed!
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
