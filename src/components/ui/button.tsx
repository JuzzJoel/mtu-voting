import React from "react";
import { motion } from "framer-motion";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      icon,
      children,
      onClick,
      type = "button",
    },
    ref
  ) => {
    const baseStyles =
      "font-semibold rounded-md transition-all duration-fast font-sans flex items-center justify-center gap-2 relative overflow-hidden";

    const sizeStyles = {
      sm: "px-4 py-2 text-body-sm h-10",
      md: "px-6 py-3 text-body-md h-12",
      lg: "px-8 py-4 text-body-lg h-[52px]",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-primary-green to-primary-purple text-white hover:shadow-glow-purple-xl hover:scale-[1.02] border border-transparent",
      secondary:
        "bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40",
      tertiary:
        "bg-neutral-surface-dark/80 border border-neutral-border text-neutral-text-primary hover:bg-neutral-card-dark hover:border-primary-purple/60",
      ghost:
        "bg-transparent text-neutral-text-primary hover:text-primary-green border-none",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin">⟳</span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
