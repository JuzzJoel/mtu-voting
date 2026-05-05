"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useVotingStore } from "@/stores/voting-store";
import { Button, Card } from "@/components/ui";

export default function VotePage() {
  const { categories, selected, loading, setLoading, setCategories, selectContestant, removeCategoryAfterVote } = useVotingStore();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const res = await fetch("/api/categories/available");
      const data = await res.json();
      setCategories(data.categories ?? []);
      setLoading(false);
    };
    void run();
  }, [setCategories, setLoading]);

  async function castVote(categoryId: string) {
    const contestantId = selected[categoryId];
    if (!contestantId) return;
    
    // Optimistic UI Update: remove category immediately for zero lag time
    removeCategoryAfterVote(categoryId);

    try {
      const csrfRes = await fetch("/api/auth/csrf");
      const csrfData = await csrfRes.json() as { token: string };

      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfData.token },
        body: JSON.stringify({ categoryId, contestantId })
      });
    } catch (err) {
      console.error("Failed to sync vote:", err);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0  left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" m-20 px-4 py-8 sm:px-6 lg:px-8 "
      >
        <div className="max-w-7xl  mx-auto">
          <h1 className="text-display-lg text-center font-heading font-bold gradient-text mb-3">
            Cast Your Vote
          </h1>
          <p className="text-body-lg text-neutral-text-secondar text-center">
            Select your preferred candidates across all categories below
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 mx-20 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin mb-4" />
              <p className="text-neutral-text-secondary">Loading categories...</p>
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="dark" className="text-center py-20">
                <div className="text-5xl mb-4">✓</div>
                <h2 className="text-h2 font-heading font-bold text-primary-green mb-2">
                  All Votes Submitted!
                </h2>
                <p className="text-neutral-text-secondary">
                  Thank you for participating in this election. Your vote matters!
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-16 my-20">
              {categories.map((category, idx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card variant="dark">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-3 py-1 rounded-lg bg-primary-green/20 text-primary-green text-caption font-semibold">
                          {idx + 1} of {categories.length}
                        </span>
                      </div>
                      <h2 className="text-h2 font-heading font-bold text-neutral-text-primary">
                        {category.title}
                      </h2>
                    </div>

                    {/* Contestants Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {category.contestants.map((contestant, cIdx) => (
                        <motion.button
                          key={contestant.id}
                          onClick={() => selectContestant(category.id, contestant.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`rounded-lg overflow-hidden border-2 transition-all duration-medium group ${
                            selected[category.id] === contestant.id
                              ? "border-primary-purple shadow-glow-purple-xl"
                              : "border-neutral-border hover:border-primary-purple/50"
                          }`}
                        >
                          <div className="relative aspect-square overflow-hidden bg-neutral-card-dark">
                            <Image
                              src={contestant.imageUrl}
                              alt={contestant.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-medium"
                            />
                            {selected[category.id] === contestant.id && (
                              <div className="absolute inset-0 bg-primary-purple/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-primary-purple/30 border-2 border-primary-purple flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-primary-green" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-3 text-center">
                            <p className="text-body-sm font-semibold text-neutral-text-primary group-hover:text-primary-green transition-colors">
                              {contestant.name}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Cast Vote Button */}
                    <div className="flex justify-center mt-8 mb-4">
                      <Button
                        onClick={() => castVote(category.id)}
                        disabled={!selected[category.id]}
                        variant="primary"
                        size="md"
                        className="w-1/2 h-[50px]"
                      >
                        Cast Vote
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
