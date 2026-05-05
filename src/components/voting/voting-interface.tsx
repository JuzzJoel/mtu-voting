"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, ProgressBar, ContestantCard, Badge } from "../ui";

export interface Contestant {
  id: string;
  name: string;
  position: string;
  image?: string;
  votes?: number;
}

export interface VotingInterfaceProps {
  categoryId: string;
  categoryName: string;
  candidates: Contestant[];
  onVote: (candidateId: string) => Promise<void>;
  hasVoted?: boolean;
  selectedId?: string | null;
  totalVotes?: number;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  categoryId,
  categoryName,
  candidates,
  onVote,
  hasVoted = false,
  selectedId = null,
  totalVotes = 0,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(selectedId);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(hasVoted);
  const [error, setError] = useState("");

  const handleVote = async (candidateId: string) => {
    if (submitted) return;

    setSelectedCandidate(candidateId);
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate || submitted) return;

    setLoading(true);
    setError("");

    try {
      await onVote(selectedCandidate);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Category Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h2 className="text-h2 font-heading font-bold text-neutral-text-primary mb-2">
              {categoryName}
            </h2>
            <p className="text-body-sm text-neutral-text-secondary">
              Select your choice below
            </p>
          </div>
          {submitted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 bg-primary-green/20 border border-primary-green rounded-lg"
            >
              <span className="text-primary-green font-semibold text-body-sm flex items-center gap-2">
                ✓ Vote Submitted
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Progress */}
        {totalVotes > 0 && (
          <ProgressBar
            value={totalVotes}
            max={Math.max(totalVotes * 2, 100)}
            color="gradient"
            showLabel
          />
        )}
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence mode="popLayout">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !submitted && handleVote(candidate.id)}
            >
              <ContestantCard
                {...candidate}
                isSelected={selectedCandidate === candidate.id}
                hasVoted={submitted}
                loading={loading && selectedCandidate === candidate.id}
                onVote={() => !submitted && handleVote(candidate.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-accent-red/10 border border-accent-red/50 mb-6"
        >
          <p className="text-accent-red text-body-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setSelectedCandidate(null)}
          >
            Clear Selection
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSubmitVote}
            isLoading={loading}
            disabled={!selectedCandidate || loading}
          >
            Submit Vote
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
