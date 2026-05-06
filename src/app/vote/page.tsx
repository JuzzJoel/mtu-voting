"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
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
    queryFn: fetchCategories,
  });

  const categories = useMemo(() => data ?? [], [data]);
  const totalCategories = categories.length;

  const progressPercent = totalCategories === 0
    ? 0
    : reviewMode
    ? 100
    : ((currentIndex + 1) / totalCategories) * 100;

  const currentCategory = categories[currentIndex];
  const currentSelection = currentCategory ? selected[currentCategory.id] : undefined;

  const selectionComplete = useMemo(() => {
    if (!categories.length) return false;
    return categories.every((c) => !!selected[c.id]);
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
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Failed to submit votes");
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
    setCurrentIndex((p) => p + 1);
  };

  const handleBack = () => {
    if (reviewMode) { setReviewMode(false); return; }
    setCurrentIndex((p) => Math.max(p - 1, 0));
  };

  const votePayload = useMemo(() =>
    categories
      .map((c) => ({ categoryId: c.id, contestantId: selected[c.id] }))
      .filter((v) => !!v.contestantId) as VotePayload[],
    [categories, selected]
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-white">
      {/* Progress header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {reviewMode ? "Review" : `${currentIndex + 1} / ${totalCategories}`}
          </p>
          <p className="text-xs text-gray-400">
            {reviewMode ? "All categories complete" : `${Math.round(progressPercent)}% complete`}
          </p>
        </div>
        <div className="max-w-4xl mx-auto h-0.5 bg-gray-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-black"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="border border-gray-200 p-8 text-center">
            <p className="text-sm font-semibold text-black mb-1">Unable to load categories</p>
            <p className="text-xs text-gray-500">Please refresh and try again.</p>
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="border border-gray-200 p-10 text-center">
            <p className="text-sm font-semibold text-black mb-2">No categories available</p>
            <Button className="mt-4" onClick={() => router.replace("/success")}>Continue</Button>
          </div>
        )}

        {!isLoading && categories.length > 0 && (
          <AnimatePresence mode="wait">
            {reviewMode ? (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-black mb-1">Review your selections</h1>
                  <p className="text-sm text-gray-500">Check everything looks right before submitting.</p>
                </div>

                <div className="border border-gray-200 mb-6">
                  {categories.map((category, i) => {
                    const choiceId = selected[category.id];
                    const choice = category.nominees.find((n) => n.id === choiceId);
                    return (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between gap-4 px-5 py-4 ${i < categories.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {choice?.imageUrl && (
                            <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-gray-100">
                              <Image src={choice.imageUrl} alt={choice.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 truncate">{category.name}</p>
                            <p className="text-sm font-semibold text-black truncate">
                              {choice?.name ?? <span className="text-gray-400 font-normal italic">Not selected</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          className="text-xs text-gray-500 hover:text-black underline underline-offset-2 flex-shrink-0"
                          onClick={() => { setReviewMode(false); setCurrentIndex(categories.findIndex((c) => c.id === category.id)); }}
                        >
                          Edit
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
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
                  <p className="mt-3 text-xs text-red-600">{(submitVotes.error as Error).message}</p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {/* Category header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                      Category {currentIndex + 1} of {totalCategories}
                    </p>
                    <h1 className="text-xl font-bold text-black">{currentCategory.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">Select one candidate to continue</p>
                  </div>
                  {currentSelection && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-shrink-0 text-xs font-semibold text-black border border-black px-2.5 py-1"
                    >
                      ✓ Selected
                    </motion.span>
                  )}
                </div>

                {/* Nominees grid */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mb-8">
                  {currentCategory.nominees.map((contestant, i) => {
                    const isSelected = selected[currentCategory.id] === contestant.id;
                    return (
                      <motion.button
                        key={contestant.id}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setVote(currentCategory.id, contestant.id)}
                        className={`group text-left focus:outline-none transition-all duration-150 ${
                          isSelected ? "ring-2 ring-black ring-offset-0" : "ring-1 ring-gray-200 hover:ring-gray-400"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                          <Image
                            src={contestant.imageUrl}
                            alt={contestant.name}
                            fill
                            className={`object-cover transition-transform duration-400 group-hover:scale-105 ${isSelected ? "scale-105" : ""}`}
                          />
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="absolute top-2 right-2 w-6 h-6 bg-black text-white flex items-center justify-center"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                        {/* Name */}
                        <div className="py-2.5 px-0.5">
                          <p className={`text-xs font-semibold leading-tight truncate ${isSelected ? "text-black" : "text-gray-800"}`}>
                            {contestant.name}
                          </p>
                          {isSelected && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-black mt-0.5"
                            >
                              Selected
                            </motion.p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button variant="secondary" size="lg" disabled={currentIndex === 0} onClick={handleBack}>
                    Previous
                  </Button>
                  <Button size="lg" className="flex-1" disabled={!currentSelection} onClick={handleNext}>
                    {currentIndex + 1 >= totalCategories ? "Review Votes" : "Next Category"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
