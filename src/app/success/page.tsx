"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        <Card variant="glass" className="p-10 md:p-14 text-center">
          {/* Animated rings + checkmark */}
          <div className="relative mx-auto mb-10 w-24 h-24">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-full border border-primary-green/20"
                style={{ transform: "translate(-50%, -50%)", left: "50%", top: "50%" }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: 1 + ring * 0.38,
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  delay: ring * 0.2,
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
              className="relative w-24 h-24 rounded-full flex items-center justify-center border border-primary-green/40"
              style={{ background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.04) 100%)" }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <motion.path
                  d="M10 20l8 8 12-16"
                  stroke="#14B8A6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-display-lg text-white leading-tight" style={{ letterSpacing: "-0.03em" }}>
              Your vote is in.
            </h1>
            <p className="mt-4 text-body-lg text-neutral-text-secondary max-w-xs mx-auto leading-relaxed">
              Thank you for shaping the MTU community. Your voice has been recorded securely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="my-8 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/">
              <Button variant="secondary" size="lg">
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
