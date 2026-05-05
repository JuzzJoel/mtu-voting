import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValues.every((v) => v)) {
      onComplete?.(newValues.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" &&!values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = "";
      setValues(newValues);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;

    const newValues = Array(length).fill("").map((_, i) => text[i] || "");
    setValues(newValues);

    const nextFocus = Math.min(text.length, length - 1);
    inputRefs.current[nextFocus]?.focus();

    if (newValues.every((v) => v)) {
      onComplete?.(newValues.join(""));
    }
  };

  // Auto focus first input on mount
  useEffect(() => {
    if (!disabled) inputRefs.current[0]?.focus();
  }, [disabled]);

  return (
    <div className="flex gap-2 sm:gap-3 justify-center w-full">
      {Array.from({ length }).map((_, index) => (
        <motion.input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={values[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0? handlePaste : undefined}
          disabled={disabled}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15, delay: index * 0.03 }}
          className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16
                     text-center text-xl sm:text-2xl md:text-3xl font-bold
                     bg-neutral-card-dark border-2 border-neutral-border/70 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-purple/50 focus:border-primary-purple
                     transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ))}
    </div>
  );
};