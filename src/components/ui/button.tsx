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
      "font-semibold rounded-md transition-all duration-fast font-heading flex items-center justify-center gap-2 relative overflow-hidden";

    const sizeStyles = {
      sm: "px-4 py-2 text-body-sm h-10",
      md: "px-6 py-3 text-body-md h-12",
      lg: "px-8 py-4 text-body-lg h-52px",
    };

    const variantStyles = {
      primary:
        "bg-primary-green text-white hover:shadow-glow-purple-xl hover:bg-primary-green/90 hover:scale-105 border border-transparent",
      secondary:
        "bg-transparent border-2 border-primary-purple text-primary-purple hover:bg-primary-purple/10 hover:border-accent-violet",
      tertiary:
        "bg-neutral-surface-dark/50 border border-neutral-border text-neutral-text-primary hover:bg-neutral-surface-dark hover:border-primary-purple",
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
