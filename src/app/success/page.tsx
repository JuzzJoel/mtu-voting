"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export default function SuccessPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm"
      >
        <div className="border border-gray-200 bg-white p-10 text-center">
          {/* Animated checkmark */}
          <div className="relative mx-auto mb-8 w-16 h-16 border border-gray-200 flex items-center justify-center">
            {[1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 border border-black"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1 + ring * 0.3, opacity: [0, 0.3, 0] }}
                transition={{
                  delay: ring * 0.15,
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <motion.path
                d="M6 14l6 6 10-12"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="text-xl font-bold text-black mb-3">Your vote is in.</h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Thank you for participating in the MTU Student Choice Awards. Your voice has been recorded securely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-100"
          >
            <Link href="/auth">
              <Button variant="secondary" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
