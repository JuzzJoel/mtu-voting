import React from "react";
import { motion } from "framer-motion";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "otp";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      icon,
      variant = "default",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "w-full rounded-xl border transition-all duration-fast text-body-md";

    const focusStyles = "focus:outline-none focus:ring-2 focus:ring-primary-purple/30 focus:border-primary-purple/60";

    const defaultStyles = `bg-white/[0.04] border-white/[0.1] text-neutral-text-primary placeholder:text-neutral-text-secondary/50 px-4 py-3 hover:border-white/20 ${focusStyles}`;

    const otpStyles =
      "w-12 h-12 text-center text-h3 font-bold bg-white/[0.04] border-white/[0.1] animate-pulse-border focus:animate-none focus:border-primary-green/60 focus:ring-2 focus:ring-primary-green/20";

    const containerClass = `relative ${icon ? "flex items-center" : ""}`;

    const inputClass =
      variant === "otp"
        ? `${baseStyles} ${otpStyles} ${className}`
        : `${baseStyles} ${defaultStyles} ${icon ? "pl-10" : ""} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-sm font-semibold text-neutral-text-primary mb-2">
            {label}
          </label>
        )}
        <motion.div className={containerClass} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {icon && (
            <div className="absolute left-3 text-neutral-text-secondary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputClass}
            disabled={disabled}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent-red text-body-sm mt-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
