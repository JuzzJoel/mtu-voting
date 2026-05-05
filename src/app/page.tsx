"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

const features = [
  {
    title: "Verified MTU Voting",
    description: "Only @mtu.edu.ng emails can participate. Secure and trusted."
  },
  {
    title: "Step-by-step Flow",
    description: "One category at a time for a focused, frictionless experience."
  },
  {
    title: "Instant Confirmation",
    description: "Submit once, get a polished success experience instantly."
  }
];

const steps = [
  { label: "Enter MTU Email", detail: "Passwordless OTP access in seconds." },
  { label: "Select Candidates", detail: "Beautiful cards, quick selections." },
  { label: "Review & Submit", detail: "Confirm and cast all votes once." }
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-mesh" />
        <div className="container-custom py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-body-sm text-neutral-text-secondary">
              MTU • Student Choice Awards 2026
            </div>
            <h1 className="mt-6 text-display-lg text-white">
              Mountain Top University
              <span className="block gradient-text">Premium Voting Experience</span>
            </h1>
            <p className="mt-6 text-body-lg text-neutral-text-secondary">
              Secure, modern, and beautifully crafted voting for MTU students. No passwords, no friction — just a guided, step-by-step experience.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button size="lg" className="w-full sm:w-auto">Start Voting</Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">See How It Works</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-custom py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card variant="glass" className="h-full p-6">
                <h3 className="text-h3 text-white mb-3">{feature.title}</h3>
                <p className="text-body-sm text-neutral-text-secondary">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container-custom py-16">
        <div className="max-w-2xl">
          <h2 className="text-display-lg text-white mb-4">How it works</h2>
          <p className="text-body-lg text-neutral-text-secondary">
            Built for real students, with real-time progress, premium interactions, and a clean, modern experience.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.label} variant="dark" className="p-6">
              <div className="text-body-sm text-neutral-text-secondary">Step {index + 1}</div>
              <h3 className="text-h3 text-white mt-2 mb-3">{step.label}</h3>
              <p className="text-body-sm text-neutral-text-secondary">{step.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-custom py-16 pb-24">
        <Card variant="glass" className="p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-display-lg text-white">Ready to vote?</h2>
            <p className="text-body-lg text-neutral-text-secondary mt-2">
              Your vote shapes the future. Step into the booth and make it count.
            </p>
          </div>
          <Link href="/auth">
            <Button size="lg" className="w-full lg:w-auto">Begin Secure Voting</Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
