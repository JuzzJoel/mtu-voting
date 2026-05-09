"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c084fc",
  "#fbbf24", "#fb923c", "#f472b6", "#34d399",
  "#60a5fa", "#ffffff", "#f9a8d4", "#86efac",
];

type Piece = {
  id: number;
  bx: number; by: number; ey: number;
  rot: number; color: string;
  w: number; h: number;
  delay: number; dur: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function ConfettiLayer() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        bx: rand(-58, 58),
        by: rand(-52, 8),
        ey: rand(50, 100),
        rot: rand(-600, 600),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: rand(5, 12),
        h: rand(7, 20),
        delay: rand(0, 0.4),
        dur: rand(1.4, 2.6),
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: "50%",
            top: "45%",
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.w > 9 ? 2 : 1,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: [`0vw`, `${p.bx * 0.55}vw`, `${p.bx}vw`],
            y: [`0vh`, `${p.by}vh`, `${p.by + p.ey}vh`],
            opacity: [1, 0.9, 0],
            rotate: [0, p.rot * 0.5, p.rot],
          }}
          transition={{
            delay: p.delay,
            duration: p.dur,
            times: [0, 0.35, 1],
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const votes = Number(searchParams.get("votes") ?? 0);

  const handleDone = () => {
    router.replace("/vote");
  };

  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 380, damping: 18 }}
        className="relative mb-8 w-24 h-24 flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1 + ring * 0.4, opacity: [0, 0.25, 0] }}
            transition={{ delay: 0.5 + ring * 0.18, duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <motion.path
            d="M9 21l9 9 15-18"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.45, duration: 0.65, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
      >
        <h1
          className="text-5xl font-black tracking-tight text-white mb-3"
          style={{ textShadow: "0 0 40px rgba(139,92,246,0.5)" }}
        >
          YOU VOTED!
        </h1>

        {votes > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="font-mono text-sm font-semibold mb-5"
            style={{ color: "#a5b4fc", letterSpacing: "0.06em" }}
          >
            {votes} CATEGOR{votes === 1 ? "Y" : "IES"} VOTED
          </motion.p>
        )}

        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your selections have been recorded securely.
        </p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.22)" }}>
          MTU Student Choice Awards 2026
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        onClick={handleDone}
        className="mt-10 px-10 py-3 text-sm font-bold font-mono tracking-widest text-white transition-opacity hover:opacity-75"
        style={{ background: "linear-gradient(135deg, #302b63, #6366f1)" }}
      >
        DONE
      </motion.button>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
      />

      <ConfettiLayer />

      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
