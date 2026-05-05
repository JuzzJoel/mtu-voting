"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full">
        <Card variant="glass" className="p-10 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-green/20 text-4xl text-primary-green"
          >
            ✓
          </motion.div>
          <h1 className="text-display-lg text-white">Vote submitted</h1>
          <p className="mt-3 text-body-lg text-neutral-text-secondary">
            Thank you for helping shape the MTU community. Your voice has been recorded securely.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="secondary" size="lg">Back to Home</Button>
            </Link>
            <Link href="/vote">
              <Button size="lg">View Voting Page</Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
