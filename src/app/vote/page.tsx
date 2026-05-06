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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function VotePage() {
  const router = useRouter();
  const { selected, setVote, clearAll } = useVotingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
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
        body: JSON.stringify({ votes }),
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
    },
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
      <div className="container-custom py-10">
        {/* Header + Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <p className="text-caption text-neutral-text-secondary uppercase tracking-widest mb-1">
                {reviewMode ? "Final Review" : `Category ${currentIndex + 1} of ${totalCategories}`}
              </p>
              <h1 className="text-h1 text-white" style={{ letterSpacing: "-0.02em" }}>
                MTU Voting Booth
              </h1>
            </div>
            <span
              className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full border text-caption font-medium transition-colors ${
                reviewMode
                  ? "border-primary-green/40 bg-primary-green/10 text-primary-green"
                  : "border-white/[0.1] bg-white/[0.04] text-neutral-text-secondary"
              }`}
            >
              {reviewMode ? "Review" : `Step ${progressStep} / ${progressTotal}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary-green to-primary-purple"
            />
          </div>

          {/* Category dots */}
          {!reviewMode && totalCategories > 0 && (
            <div className="mt-3 flex gap-1.5">
              {categories.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === currentIndex ? 24 : i < currentIndex ? 16 : 8,
                    opacity: i <= currentIndex ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`h-1 rounded-full ${
                    i < currentIndex ? "bg-primary-green" : i === currentIndex ? "bg-primary-purple" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>

        {isLoading && (
          <div className="py-20 flex items-center justify-center">
            <div className="w-9 h-9 border-2 border-primary-purple/20 border-t-primary-purple rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card variant="glass" className="p-8">
            <h2 className="text-h2 text-white mb-2">Unable to load categories</h2>
            <p className="text-body-sm text-neutral-text-secondary">Please refresh and try again.</p>
          </Card>
        )}

        {!isLoading && categories.length === 0 && (
          <Card variant="glass" className="p-10 text-center">
            <h2 className="text-h2 text-white mb-2">You&apos;re all set!</h2>
            <p className="text-body-sm text-neutral-text-secondary">No categories are available right now.</p>
            <Button className="mt-6" onClick={() => router.replace("/success")}>
              Go to Success
            </Button>
          </Card>
        )}

        {!isLoading && categories.length > 0 && (
          <AnimatePresence mode="wait">
            {reviewMode ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card variant="glass" className="p-6 md:p-8">
                  <div className="mb-6">
                    <h2 className="text-h2 text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
                      Review your selections
                    </h2>
                    <p className="text-body-sm text-neutral-text-secondary">
                      Make sure everything looks right before submitting.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {categories.map((category) => {
                      const choiceId = selected[category.id];
                      const choice = category.nominees.find((n) => n.id === choiceId);
                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:border-white/[0.14] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {choice?.imageUrl && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-card-dark">
                                <Image
                                  src={choice.imageUrl}
                                  alt={choice.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-caption text-neutral-text-secondary truncate">{category.name}</p>
                              <p className="text-body-md text-white font-semibold truncate">
                                {choice?.name ?? (
                                  <span className="text-neutral-text-secondary italic font-normal">Not selected</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => {
                              setReviewMode(false);
                              setCurrentIndex(categories.findIndex((c) => c.id === category.id));
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className="mt-8 flex flex-col sm:flex-row gap-4 pt-6"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Button variant="secondary" size="lg" onClick={handleBack}>
                      Back
                    </Button>
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
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Card variant="glass" className="p-6 md:p-8">
                  {/* Category header */}
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-purple/10 border border-primary-purple/20 text-caption text-primary-purple font-medium mb-3">
                        Category {currentIndex + 1} of {totalCategories}
                      </span>
                      <h2 className="text-h2 text-white" style={{ letterSpacing: "-0.02em" }}>
                        {currentCategory.name}
                      </h2>
                      <p className="text-body-sm text-neutral-text-secondary mt-1">Select one candidate to continue</p>
                    </div>
                    {currentSelection && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-green/10 border border-primary-green/30 text-caption text-primary-green font-medium flex-shrink-0"
                      >
                        <CheckIcon />
                        Selected
                      </motion.div>
                    )}
                  </div>

                  {/* Nominees grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {currentCategory.nominees.map((contestant, i) => {
                      const isSelected = selected[currentCategory.id] === contestant.id;
                      return (
                        <motion.button
                          key={contestant.id}
                          type="button"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.35 }}
                          whileHover={{ scale: 1.02, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setVote(currentCategory.id, contestant.id)}
                          className={`group relative text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green/50 ${
                            isSelected
                              ? "border-primary-green shadow-glow-green"
                              : "border-white/[0.08] hover:border-white/25"
                          }`}
                        >
                          {/* Portrait image container */}
                          <div className="relative aspect-[3/4] overflow-hidden bg-neutral-card-dark">
                            <Image
                              src={contestant.imageUrl}
                              alt={contestant.name}
                              fill
                              className={`object-cover transition-transform duration-500 ${
                                isSelected ? "scale-105" : "group-hover:scale-105"
                              }`}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                            {/* Selected tint */}
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-primary-green/[0.07]"
                              />
                            )}

                            {/* Check badge */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary-green text-white flex items-center justify-center shadow-glow-green"
                              >
                                <CheckIcon />
                              </motion.div>
                            )}

                            {/* Name at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-semibold text-body-md leading-tight">
                                {contestant.name}
                              </h3>
                              {isSelected && (
                                <motion.p
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-primary-green text-caption font-medium mt-0.5"
                                >
                                  Selected
                                </motion.p>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div
                    className="mt-8 flex flex-col sm:flex-row gap-4 pt-6"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Button variant="secondary" size="lg" disabled={currentIndex === 0} onClick={handleBack}>
                      Previous
                    </Button>
                    <Button size="lg" className="flex-1" disabled={!currentSelection} onClick={handleNext}>
                      {currentIndex + 1 >= totalCategories ? "Review All Votes" : "Next Category"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
