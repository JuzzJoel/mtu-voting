import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./card";

export interface ContestantCardProps {
  id: string;
  name: string;
  image?: string;
  position: string;
  onVote?: () => void;
  isSelected?: boolean;
  hasVoted?: boolean;
  votes?: number;
  loading?: boolean;
}

export const ContestantCard: React.FC<ContestantCardProps> = ({
  id,
  name,
  image,
  position,
  onVote,
  isSelected = false,
  hasVoted = false,
  votes,
  loading = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card
        interactive
        glow={isSelected ? "green" : "none"}
        variant="glass"
        className={`relative overflow-hidden transition-all duration-fast ${
          isSelected ? "ring-2 ring-primary-green" : ""
        } ${hasVoted ? "opacity-60" : ""}`}
      >
        {/* Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-primary-green/20 to-primary-purple/20 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🗳️
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-card-dark via-transparent to-transparent" />

          {/* Selected Badge */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 bg-primary-green text-white rounded-full p-2 text-xl"
            >
              ✓
            </motion.div>
          )}

          {/* Voted Badge */}
          {hasVoted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl mb-2"
                >
                  ✓
                </motion.div>
                <span className="text-white font-semibold">Vote Submitted</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <CardContent className="pt-4">
          <h3 className="text-h3 font-bold text-neutral-text-primary mb-1">
            {name}
          </h3>
          <p className="text-body-sm text-neutral-text-secondary mb-4">
            {position}
          </p>

          {/* Vote Count */}
          {votes !== undefined && (
            <div className="mb-4 p-3 bg-neutral-surface-dark/50 rounded-md border border-neutral-border/50">
              <div className="flex items-center justify-between">
                <span className="text-caption text-neutral-text-secondary">
                  Current Votes
                </span>
                <span className="text-h3 font-bold bg-gradient-to-r from-primary-green to-primary-purple bg-clip-text text-transparent">
                  {votes}
                </span>
              </div>
            </div>
          )}

          {/* Vote Button */}
          {!hasVoted && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onVote}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary-green to-primary-purple text-white font-semibold rounded-md hover:shadow-glow-green transition-all duration-fast disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="animate-spin">⟳</span> Voting...
                </span>
              ) : (
                "Cast Vote"
              )}
            </motion.button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
