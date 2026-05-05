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
      "w-full rounded-md border transition-all duration-fast text-body-md";

    const focusStyles = "focus:outline-none focus:ring-4 focus:ring-primary-purple/25 focus:border-primary-purple";

    const defaultStyles = `bg-neutral-surface-dark/50 border-neutral-border text-neutral-text-primary placeholder-neutral-text-secondary ${focusStyles}`;

    const otpStyles =
      "w-12 h-12 text-center text-h3 font-bold bg-neutral-card-dark border-neutral-border animate-pulse-border focus:animate-none";

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
