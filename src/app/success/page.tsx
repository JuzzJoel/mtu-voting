"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export default function SuccessPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white p-10 text-center" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          {/* Animated check */}
          <div className="relative mx-auto mb-8 w-16 h-16 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {[1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1 + ring * 0.35, opacity: [0, 0.4, 0] }}
                transition={{ delay: ring * 0.15, duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <motion.path
                d="M6 14l6 6 10-12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              />
            </svg>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h1 className="text-xl font-bold text-black mb-3">Your vote is in.</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Thank you for participating in the MTU Student Choice Awards 2026. Your selections have been recorded securely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-100"
          >
            <Link href="/auth">
              <Button variant="secondary" size="lg" className="w-full">Back to Home</Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
