import React from "react";
import { motion, MotionProps } from "framer-motion";

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
      "rounded-lg border transition-all duration-fast overflow-hidden";

    const variantStyles = {
      default:
        "bg-neutral-card-dark border-neutral-border shadow-card",
      glass:
        "bg-white/10 backdrop-blur-glass border border-white/20 shadow-lg",
      dark:
        "bg-neutral-surface-dark border-neutral-border/50",
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
  <div className={`px-6 py-4 border-b border-neutral-border/50 ${className}`} {...props} />
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
    className={`px-6 py-3 bg-neutral-surface-dark/50 border-t border-neutral-border/50 flex items-center gap-3 ${className}`}
    {...props}
  />
);
