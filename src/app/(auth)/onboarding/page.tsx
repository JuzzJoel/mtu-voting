"use client";

import { FormEvent, useState ,useEffect} from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { Button, Card, Input } from "@/components/ui";
import { LEVELS, DEPARTMENTS } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const state = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    router.prefetch("/vote");
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!state.name.trim() || !state.level || !state.department) return;
    
    setLoading(true);
    setError("");

    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json() as { ok: boolean; token: string };
      const csrf = csrfData.token;

      if (!csrf) {
        setError("Security check failed. Please refresh and try again.");
        return;
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ name: state.name, level: state.level, department: state.department })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save");
        return;
      }
      state.reset();
      router.replace(data.nextRoute);
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
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
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
            whileHover={{ scale: 1.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-green/20 rounded-xl blur-xl opacity-75" />
              <div className="relative h-16 w-16 rounded-xl bg-primary-green flex items-center justify-center text-white text-3xl">
                ✨
              </div>
            </div>
          </motion.div>
          <h1 className="text-display-lg font-heading font-bold text-neutral-text-primary mb-2">
            Complete Your Profile
          </h1>
          <p className="text-body-lg text-neutral-text-secondary">
            Personalize your voting experience in just a moment
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="dark" className="border-primary-purple/50">
            <div className="px-6 py-8 relative">
              {/* Loading Overlay */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-card-dark/90 backdrop-blur-sm rounded-lg"
                >
                  <div className="w-16 h-16 border-4 border-primary-green/30 border-t-primary-green rounded-full animate-spin mb-4" />
                  <p className="text-primary-green font-semibold text-lg animate-pulse">Setting up your profile...</p>
                </motion.div>
              )}

           <form className="space-y-5 sm:space-y-6" onSubmit={submit}>
  {/* Full Name */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.25 }}
  >
    <Input 
      type="text"
      label="Full Name"
      placeholder="e.g., Adekunle Maxwell"
      value={state.name} 
      onChange={(e) => state.setField("name", e.target.value)} 
                    required 
                     className="text-lg py-4 px-5 md:text-lg md:py-5"
    />
  </motion.div>

  {/* Level */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.25 }}
  >
    <label htmlFor="level" className="block text-body-sm font-semibold text-neutral-text-primary mb-2">
      Academic Level
    </label>
    <select 
      id="level"
      className="w-full px-4 py-3 bg-neutral-card-dark/50 border-2 border-neutral-border rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-primary-purple/40 focus:border-primary-purple 
                 transition-all duration-150 text-neutral-text-primary"
      value={state.level} 
      onChange={(e) => state.setField("level", e.target.value)} 
      required
    >
      <option value="" disabled>Select your level</option>
      {LEVELS.map((level) => (
        <option key={level} value={level}>{level} Level</option>
      ))}
    </select>
  </motion.div>

  {/* Department */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.25 }}
  >
    <label htmlFor="department" className="block text-body-sm font-semibold text-neutral-text-primary mb-2">
      Department
    </label>
    <select 
      id="department"
      className="w-full px-4 py-3 bg-neutral-card-dark/50 border-2 border-neutral-border rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-primary-purple/40 focus:border-primary-purple 
                 transition-all duration-150 text-neutral-text-primary"
      value={state.department} 
      onChange={(e) => state.setField("department", e.target.value)} 
      required
    >
      <option value="" disabled>Select your department</option>
      {DEPARTMENTS.map((department) => (
        <option key={department} value={department}>{department}</option>
      ))}
    </select>
  </motion.div>

  {/* Error Message */}
  {error && (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 bg-error/10 border border-error/30 rounded-lg"
    >
      <p className="text-sm font-medium text-error">{error}</p>
    </motion.div>
  )}

  {/* Submit Button */}
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.25 }}
    className="pt-2"
  >
    <Button 
      type="submit"
      variant="primary"
      size="lg"
      className="w-full mb-5 mt-2 h-16" 
      isLoading={loading}
                    disabled={loading || !state.name.trim() || !state.level || !state.department}
                    
    >
      Continue to Voting
    </Button>
  </motion.div>
</form>
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
          Your information helps organize voting by department and level
        </motion.p>
      </div>
    </motion.div>
  );
}
