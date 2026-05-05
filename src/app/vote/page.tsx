"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card } from "@/components/ui";
import { useVotingStore } from "@/stores/voting-store";

type Nominee = { id: string; name: string; imageUrl: string };

type Category = { id: string; name: string; order: number; nominees: Nominee[] };

type VotePayload = { categoryId: string; contestantId: string };

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to load categories");
  return (await res.json()) as Category[];
};

const fetchCsrfToken = async () => {
  const res = await fetch("/api/auth/csrf");
  const data = (await res.json()) as { token?: string };
  return data.token ?? "";
};

export default function VotePage() {
  const router = useRouter();
  const { selected, setVote, clearAll } = useVotingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });

  const categories = useMemo(() => data ?? [], [data]);
  const totalCategories = categories.length;

  const progressTotal = totalCategories + 1;
  const progressStep = reviewMode ? progressTotal : Math.min(currentIndex + 1, progressTotal);
  const progressPercent = progressTotal === 0 ? 0 : (progressStep / progressTotal) * 100;

  const currentCategory = categories[currentIndex];
  const currentSelection = currentCategory ? selected[currentCategory.id] : undefined;

  const selectionComplete = useMemo(() => {
    if (!categories.length) return false;
    return categories.every((category) => !!selected[category.id]);
  }, [categories, selected]);

  const submitVotes = useMutation({
    mutationFn: async (votes: VotePayload[]) => {
      const csrf = await fetchCsrfToken();
      if (!csrf) throw new Error("Missing CSRF token");
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ votes })
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to submit votes");
      }
      return res.json();
    },
    onSuccess: () => {
      clearAll();
      router.replace("/success");
    }
  });

  const handleNext = () => {
    if (!currentCategory || !currentSelection) return;
    if (currentIndex + 1 >= totalCategories) {
      setReviewMode(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    if (reviewMode) {
      setReviewMode(false);
      return;
    }
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const votePayload = useMemo(() => {
    return categories
      .map((category) => ({ categoryId: category.id, contestantId: selected[category.id] }))
      .filter((vote) => !!vote.contestantId) as VotePayload[];
  }, [categories, selected]);

  return (
    <div className="min-h-screen">
      <div className="container-custom py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-display-lg text-white">MTU Voting Booth</h1>
              <p className="text-body-lg text-neutral-text-secondary">Select one candidate per category and submit once.</p>
            </div>
            <div className="text-body-sm text-neutral-text-secondary">
              Step {progressStep} / {progressTotal}
            </div>
          </div>
          <div className="mt-6 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-primary-green to-primary-purple"
            />
          </div>
        </motion.div>

        {isLoading && (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card variant="glass" className="mt-10 p-6">
            <h2 className="text-h2 text-white mb-2">Unable to load categories</h2>
            <p className="text-body-sm text-neutral-text-secondary">Please refresh the page and try again.</p>
          </Card>
        )}

        {!isLoading && categories.length === 0 && (
          <Card variant="glass" className="mt-10 p-8 text-center">
            <h2 className="text-h2 text-white mb-2">You are all set!</h2>
            <p className="text-body-sm text-neutral-text-secondary">No categories are available for voting right now.</p>
            <Button className="mt-6" onClick={() => router.replace("/success")}>Go to Success</Button>
          </Card>
        )}

        {!isLoading && categories.length > 0 && (
          <div className="mt-10">
            <AnimatePresence mode="wait">
              {reviewMode ? (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card variant="glass" className="p-6">
                    <h2 className="text-h2 text-white mb-4">Review your selections</h2>
                    <div className="space-y-4">
                      {categories.map((category) => {
                        const choiceId = selected[category.id];
                        const choice = category.nominees.find((contestant) => contestant.id === choiceId);
                        return (
                          <div key={category.id} className="flex items-center justify-between gap-4 border border-white/10 rounded-xl p-4">
                            <div>
                              <p className="text-body-sm text-neutral-text-secondary">{category.name}</p>
                              <p className="text-body-md text-white font-semibold">{choice?.name ?? "Not selected"}</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => {
                              setReviewMode(false);
                              setCurrentIndex(categories.findIndex((c) => c.id === category.id));
                            }}>
                              Edit
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                      <Button variant="secondary" size="lg" onClick={handleBack}>Back</Button>
                      <Button
                        size="lg"
                        className="flex-1"
                        disabled={!selectionComplete || submitVotes.isPending}
                        isLoading={submitVotes.isPending}
                        onClick={() => submitVotes.mutate(votePayload)}
                      >
                        Submit All Votes
                      </Button>
                    </div>
                    {submitVotes.isError && (
                      <p className="mt-4 text-body-sm text-accent-red">{(submitVotes.error as Error).message}</p>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={currentCategory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card variant="glass" className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-body-sm text-neutral-text-secondary">Category</p>
                        <h2 className="text-h2 text-white">{currentCategory.name}</h2>
                      </div>
                      <div className="text-body-sm text-neutral-text-secondary">{currentIndex + 1} / {totalCategories}</div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {currentCategory.nominees.map((contestant) => {
                        const isSelected = selected[currentCategory.id] === contestant.id;
                        return (
                          <motion.button
                            key={contestant.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setVote(currentCategory.id, contestant.id)}
                            className={`text-left rounded-2xl border transition-all duration-fast overflow-hidden ${
                              isSelected ? "border-primary-green shadow-glow-green" : "border-white/10"
                            }`}
                          >
                            <div className="relative h-48 w-full bg-neutral-card-dark">
                              <Image
                                src={contestant.imageUrl}
                                alt={contestant.name}
                                fill
                                className="object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-primary-green text-white flex items-center justify-center">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-body-md text-white font-semibold">{contestant.name}</h3>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button variant="secondary" size="lg" disabled={currentIndex === 0} onClick={handleBack}>
                        Previous
                      </Button>
                      <Button
                        size="lg"
                        className="flex-1"
                        disabled={!currentSelection}
                        onClick={handleNext}
                      >
                        {currentIndex + 1 >= totalCategories ? "Review Votes" : "Next Category"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
