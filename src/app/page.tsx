"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckMini = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const features = [
  {
    num: "01",
    title: "Verified MTU Access",
    description: "Only @mtu.edu.ng emails can participate. Every vote is authenticated and trusted.",
    accent: "text-primary-green",
  },
  {
    num: "02",
    title: "Guided Step-by-step",
    description: "One category at a time for a focused, frictionless experience from start to finish.",
    accent: "text-primary-purple",
  },
  {
    num: "03",
    title: "Instant Confirmation",
    description: "Submit once and receive a polished, immediate confirmation of your choices.",
    accent: "text-accent-violet",
  },
];

const steps = [
  { num: "1", label: "Enter MTU Email", detail: "Passwordless OTP access in seconds — no password required." },
  { num: "2", label: "Select Candidates", detail: "Beautiful cards, one category at a time, quick and guided." },
  { num: "3", label: "Review & Submit", detail: "Confirm all your choices before casting them once and for all." },
];

const trust = ["Secure OTP Auth", "One-time Voting", "MTU Verified Only"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary-purple/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-40 left-[-80px] w-[500px] h-[500px] bg-primary-green/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-accent-violet/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="container-custom pt-20 pb-20 lg:pt-28 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm text-body-sm text-neutral-text-secondary mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-green animate-pulse flex-shrink-0" />
              MTU Student Choice Awards 2026
            </motion.div>

            <h1 className="text-display-xl text-white" style={{ lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              Cast Your Vote.
              <span className="block gradient-text">Shape History.</span>
            </h1>

            <p className="mt-6 text-body-lg text-neutral-text-secondary max-w-xl leading-relaxed">
              The official secure voting platform for Mountain Top University. No passwords, no friction — just a clean, guided experience built for every student.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2.5">
                  Start Voting
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  How It Works
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-6"
            >
              {trust.map((item) => (
                <div key={item} className="flex items-center gap-2 text-body-sm text-neutral-text-secondary">
                  <span className="text-primary-green flex-shrink-0">
                    <CheckMini />
                  </span>
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-caption text-neutral-text-secondary uppercase tracking-widest mb-3">Why MTUVote</p>
          <h2 className="text-h1 text-white max-w-xs" style={{ letterSpacing: "-0.02em" }}>
            Built for this moment.
          </h2>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="h-full p-7 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all duration-300 cursor-default">
                <div className={`font-bold mb-5 opacity-[0.1] ${feature.accent}`} style={{ fontSize: "52px", lineHeight: 1 }}>
                  {feature.num}
                </div>
                <h3 className="text-h3 text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
                  {feature.title}
                </h3>
                <p className="text-body-sm text-neutral-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-caption text-neutral-text-secondary uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-h1 text-white" style={{ letterSpacing: "-0.02em" }}>
            Three steps. That&apos;s it.
          </h2>
          <p className="mt-4 text-body-lg text-neutral-text-secondary">
            Designed for simplicity — from authentication to submission in under two minutes.
          </p>
        </motion.div>
        <div className="relative grid gap-6 lg:grid-cols-3">
          <div className="hidden lg:block absolute top-[38px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary-green/25 via-primary-purple/25 to-accent-violet/25" />
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div className="relative p-6 rounded-2xl border border-white/[0.07] bg-neutral-surface-dark/60">
                <div className="mb-5 w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-primary-green/20 to-primary-purple/20 border border-white/[0.1] flex items-center justify-center">
                  <span className="text-white font-bold text-body-sm">{step.num}</span>
                </div>
                <h3 className="text-h3 text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
                  {step.label}
                </h3>
                <p className="text-body-sm text-neutral-text-secondary">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-custom py-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.1] p-10 md:p-14"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-purple/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-green/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-caption text-primary-green uppercase tracking-widest mb-3">Ready?</p>
              <h2 className="text-display-lg text-white leading-tight" style={{ letterSpacing: "-0.03em" }}>
                Your vote matters.
              </h2>
              <p className="mt-4 text-body-lg text-neutral-text-secondary">
                Step into the booth and make your voice heard. Every vote shapes the MTU community.
              </p>
            </div>
            <Link href="/auth" className="flex-shrink-0">
              <Button size="lg" className="gap-2.5">
                Begin Voting
                <ArrowRight />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
