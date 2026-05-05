"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, ProgressRing, Badge, Button } from "../ui";

export interface DashboardStatProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  color?: "green" | "purple" | "none";
}

export const DashboardStat: React.FC<DashboardStatProps> = ({
  label,
  value,
  change,
  trend,
  icon,
  color = "purple",
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card variant="glass" glow={color} className="h-full">
        <CardContent className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-body-sm text-neutral-text-secondary mb-2">
              {label}
            </p>
            <h3 className="text-h2 font-bold text-neutral-text-primary mb-2">
              {value}
            </h3>
            {change && (
              <span
                className={`text-body-sm font-semibold flex items-center gap-1 ${
                  trend === "up" ? "text-primary-green" : "text-accent-red"
                }`}
              >
                {trend === "up" ? "↑" : "↓"} {change}
              </span>
            )}
          </div>
          {icon && <div className="text-3xl">{icon}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export interface LiveCounterProps {
  category: string;
  totalVotes: number;
  percentage: number;
  animated?: boolean;
}

export const LiveCounter: React.FC<LiveCounterProps> = ({
  category,
  totalVotes,
  percentage,
  animated = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-6 p-4 rounded-lg bg-neutral-card-dark/50 border border-neutral-border/50 hover:border-primary-purple/50 transition-colors"
    >
      <div className="flex-1">
        <h4 className="text-body-md font-semibold text-neutral-text-primary mb-2">
          {category}
        </h4>
        <p className="text-body-sm text-neutral-text-secondary">
          {totalVotes} votes cast
        </p>
      </div>
      <ProgressRing
        value={percentage}
        size="sm"
        color="gradient"
      />
    </motion.div>
  );
};

export interface CandidateStatsProps {
  name: string;
  position: string;
  votes: number;
  percentage: number;
  image?: string;
}

export const CandidateStats: React.FC<CandidateStatsProps> = ({
  name,
  position,
  votes,
  percentage,
  image,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden rounded-lg"
    >
      <Card variant="dark">
        <CardContent className="flex items-center gap-4">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h4 className="text-body-md font-bold text-neutral-text-primary">
              {name}
            </h4>
            <p className="text-body-sm text-neutral-text-secondary mb-3">
              {position}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex-1 h-2 bg-neutral-border rounded-full mr-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary-green to-primary-purple rounded-full"
                />
              </div>
              <span className="text-body-sm font-bold text-neutral-text-primary">
                {percentage}%
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-h3 font-bold bg-gradient-to-r from-primary-green to-primary-purple bg-clip-text text-transparent">
              {votes}
            </p>
            <p className="text-caption text-neutral-text-secondary">votes</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export interface DepartmentFilterProps {
  departments: string[];
  selectedDepartment?: string;
  onSelect: (department: string) => void;
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selectedDepartment,
  onSelect,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2"
    >
      <Button
        variant={!selectedDepartment ? "primary" : "secondary"}
        size="sm"
        onClick={() => onSelect("")}
      >
        All Departments
      </Button>
      {departments.map((dept) => (
        <Button
          key={dept}
          variant={selectedDepartment === dept ? "primary" : "secondary"}
          size="sm"
          onClick={() => onSelect(dept)}
        >
          {dept}
        </Button>
      ))}
    </motion.div>
  );
};

export interface LiveIndicatorProps {
  isLive?: boolean;
  label?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  isLive = true,
  label = "Live Results",
}) => {
  return (
    <motion.div
      animate={isLive ? { opacity: [1, 0.5, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-green/20 border border-primary-green/50"
    >
      <motion.div
        animate={isLive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2 h-2 bg-primary-green rounded-full"
      />
      <span className="text-body-sm font-semibold text-primary-green">
        {label}
      </span>
    </motion.div>
  );
};
