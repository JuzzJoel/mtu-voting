import React from "react";
import { motion } from "framer-motion";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "green" | "purple" | "gradient";
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  max = 100,
  size = "md",
  color = "gradient",
}) => {
  const percentage = (value / max) * 100;

  const sizeClass = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }[size];

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClass = {
    green: "from-primary-green to-accent-mint",
    purple: "from-primary-purple to-accent-violet",
    gradient: "from-primary-green to-primary-purple",
  }[color];

  return (
    <div className={`relative ${sizeClass} flex items-center justify-center`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`bg-gradient-to-r ${colorClass}`}
          style={{
            stroke: `url(#gradient-${color})`,
          }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {color === "green" && (
              <>
                <stop offset="0%" stopColor="#16C47F" />
                <stop offset="100%" stopColor="#34D399" />
              </>
            )}
            {color === "purple" && (
              <>
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#A855F7" />
              </>
            )}
            {color === "gradient" && (
              <>
                <stop offset="0%" stopColor="#16C47F" />
                <stop offset="100%" stopColor="#7C3AED" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-h3 font-bold text-neutral-text-primary">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export interface ProgressBarProps {
  value: number;
  max?: number;
  animated?: boolean;
  color?: "green" | "purple" | "gradient";
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  animated = true,
  color = "gradient",
  showLabel = true,
}) => {
  const percentage = (value / max) * 100;

  const colorClass = {
    green: "from-primary-green to-accent-mint",
    purple: "from-primary-purple to-accent-violet",
    gradient: "from-primary-green to-primary-purple",
  }[color];

  return (
    <div className="w-full">
      <div className="h-2 bg-neutral-surface-dark rounded-full overflow-hidden border border-neutral-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.6 : 0 }}
          className={`h-full bg-gradient-to-r ${colorClass}`}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex justify-between text-caption text-neutral-text-secondary">
          <span>{value} votes</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};
