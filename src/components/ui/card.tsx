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
    const baseStyles = "rounded-none border transition-all duration-150 overflow-hidden";

    const variantStyles = {
      default: "bg-white border-gray-200 shadow-sm",
      glass: "bg-white border-gray-200 shadow-sm",
      dark: "bg-gray-50 border-gray-200",
    };

    const interactiveStyles = interactive ? "cursor-pointer" : "";

    const motionProps = hoverScale
      ? { whileHover: { scale: 1.01 }, whileTap: { scale: 0.99 } }
      : {};

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
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
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`} {...props} />
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
    className={`px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3 ${className}`}
    {...props}
  />
);
