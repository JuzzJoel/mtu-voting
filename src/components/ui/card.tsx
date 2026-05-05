import React from "react";
import { motion } from "framer-motion";

export interface CardProps {
  interactive?: boolean;
  glow?: "green" | "purple" | "none";
  variant?: "default" | "glass" | "dark";
  hoverScale?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = "",
      interactive = false,
      glow = "none",
      variant = "default",
      hoverScale = true,
      children,
    },
    ref
  ) => {
    const baseStyles =
      "rounded-2xl border transition-all duration-fast overflow-hidden";

    const variantStyles = {
      default:
        "bg-neutral-card-dark border-neutral-border/70 shadow-card",
      glass:
        "bg-white/5 backdrop-blur-glass border border-white/15 shadow-lg",
      dark:
        "bg-neutral-surface-dark/90 border-neutral-border/60",
    };

    const glowStyles = {
      green: "hover:shadow-glow-green",
      purple: "hover:shadow-glow-purple",
      none: "",
    };

    const interactiveStyles = interactive ? "cursor-pointer" : "";

    const motionProps = hoverScale
      ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }
      : {};

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${glowStyles[glow]} ${interactiveStyles} ${className}`}
        {...(interactive ? motionProps : {})}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-white/5 ${className}`} {...props} />
);

export const CardContent = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 ${className}`} {...props} />
);

export const CardFooter = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`px-6 py-3 bg-neutral-surface-dark/70 border-t border-white/5 flex items-center gap-3 ${className}`}
    {...props}
  />
);
