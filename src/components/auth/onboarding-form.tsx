"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Card } from "../ui";

export interface OnboardingFormProps {
  email: string;
  onSubmit: (data: { name: string; department: string; level: string }) => Promise<void>;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ email, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    level: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const departments = [
    "Computer Science",
    "Business",
    "Engineering",
    "Health Sciences",
    "Arts & Sciences",
    "Other",
  ];

  const levels = ["100", "200", "300", "400", "Postgraduate"];

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (step === 2 && !formData.department) {
      setError("Please select your department");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.level) {
      setError("Please select your level");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card variant="dark" className="border-primary-purple/50">
        <div className="px-6 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  className={`h-2 flex-1 rounded-full mx-1 transition-all duration-fast ${
                    s <= step ? "bg-gradient-to-r from-primary-green to-primary-purple" : "bg-neutral-border"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                />
              ))}
            </div>
            <p className="text-caption text-neutral-text-secondary text-center">
              Step {step} of 3
            </p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-h2 font-bold mb-2">
              {step === 1 && "What's Your Name?"}
              {step === 2 && "Which Department?"}
              {step === 3 && "Academic Level?"}
            </h2>
            <p className="text-neutral-text-secondary text-sm">
              {step === 1 && "Help us personalize your voting experience"}
              {step === 2 && "This helps organize voting results"}
              {step === 3 && "Almost done! One last step"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Name */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  label="Full Name"
                />
              </motion.div>
            )}

            {/* Step 2: Department */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <label className="block text-body-sm font-semibold text-neutral-text-primary">
                  Department
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setFormData({ ...formData, department: dept })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-left font-medium ${
                        formData.department === dept
                          ? "border-primary-green bg-primary-green/10 text-primary-green"
                          : "border-neutral-border text-neutral-text-primary hover:border-primary-purple/50"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Level */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <label className="block text-body-sm font-semibold text-neutral-text-primary">
                  Academic Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, level })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-center font-medium ${
                        formData.level === level
                          ? "border-primary-green bg-primary-green/10 text-primary-green"
                          : "border-neutral-border text-neutral-text-primary hover:border-primary-purple/50"
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-accent-red/10 border border-accent-red/50"
              >
                <p className="text-accent-red text-body-sm">{error}</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  isLoading={loading}
                >
                  Complete Onboarding
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    </motion.div>
  );
};
