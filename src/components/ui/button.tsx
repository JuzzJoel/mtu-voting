import React from "react";
import { motion } from "framer-motion";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
      style,
      onClick,
      type = "button",
    },
    ref
  ) => {
    const baseStyles =
      "font-semibold rounded-md transition-all duration-150 font-sans flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed";

    const sizeStyles = {
      sm: "px-4 py-2 text-xs h-8",
      md: "px-5 py-2.5 text-sm h-10",
      lg: "px-6 py-3 text-sm h-11",
    };

    const variantStyles = {
      primary: "bg-black text-white hover:bg-gray-800 border border-black",
      secondary: "bg-white text-gray-900 border border-gray-300 hover:border-gray-900 hover:bg-gray-50",
      tertiary: "bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-900",
      ghost: "bg-transparent text-gray-700 hover:text-black border-none",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        style={style}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        {isLoading ? (
          <span className="flex items-center gap-1">
            {[0, 120, 240].map((delay) => (
              <span
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
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
