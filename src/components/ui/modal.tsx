import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${sizeClass}`}
          >
            <div className="bg-neutral-card-dark border border-neutral-border rounded-lg shadow-card overflow-hidden">
              {title && (
                <div className="px-6 py-4 border-b border-neutral-border/50">
                  <h2 className="text-h2 font-heading font-bold text-neutral-text-primary">
                    {title}
                  </h2>
                </div>
              )}
              <div className="px-6 py-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "sm",
  children,
}) => {
  const variantStyles = {
    primary: "bg-primary-purple/20 text-accent-violet",
    secondary: "bg-primary-green/20 text-primary-green",
    success: "bg-accent-mint/20 text-accent-mint",
    warning: "bg-accent-gold/20 text-accent-gold",
    danger: "bg-accent-red/20 text-accent-red",
  };

  const sizeClass = {
    sm: "px-2 py-1 text-caption",
    md: "px-3 py-2 text-body-sm",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${variantStyles[variant]} ${sizeClass}`}
    >
      {children}
    </span>
  );
};
