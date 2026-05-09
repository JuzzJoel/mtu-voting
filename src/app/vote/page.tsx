"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { useVotingStore } from "@/stores/voting-store";

// Voting closes 50 hours after 2026-05-09 09:00 WAT (UTC+1)
const VOTING_DEADLINE = new Date("2026-05-11T16:00:00Z");

function useCountdown(deadline: Date) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, deadline.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const expired = remaining === 0;

  return { hours, minutes, seconds, expired };
}

function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const { hours, minutes, seconds, expired } = useCountdown(VOTING_DEADLINE);

  if (expired) {
    return (
      <p className="font-mono text-xs font-semibold" style={{ color: "#f87171" }}>
        VOTING CLOSED
      </p>
    );
  }

  if (compact) {
    return (
      <p className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")} LEFT
      </p>
    );
  }

  return (
    <div>
      <p className="font-mono text-[10px] mb-1.5" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
        VOTING ENDS IN
      </p>
      <div className="flex items-center gap-1.5">
        {[{ v: hours, l: "HRS" }, { v: minutes, l: "MIN" }, { v: seconds, l: "SEC" }].map(({ v, l }) => (
          <div key={l} className="flex flex-col items-center">
            <div
              className="font-mono font-bold text-sm leading-none px-2 py-1.5 min-w-[36px] text-center"
              style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {String(v).padStart(2, "0")}
            </div>
            <span className="font-mono mt-0.5" style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Nominee = { id: string; name: string; imageUrl: string; description: string | null };
type Category = { id: string; name: string; order: number; nominees: Nominee[] };
type VotePayload = { categoryId: string; contestantId: string };

const PAGE_BG = "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)";
const ACCENT_GRAD = "linear-gradient(135deg, #6366f1, #8b5cf6)";
const BTN_STYLE = {
  background: "linear-gradient(135deg, #302b63, #6366f1)",
  border: "none",
  color: "white",
} as React.CSSProperties;

// Glass card style — the main panels
const GLASS = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.12)",
} as React.CSSProperties;

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json() as Promise<Category[]>;
}

// ── Sidebar status dot ───────────────────────────────────────────────────────
function StatusDot({ status }: { status: "voted" | "skipped" | "active" | "unvisited" }) {
  const base: React.CSSProperties = { width: 20, height: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" };

  if (status === "voted")
    return (
      <div style={{ ...base, background: ACCENT_GRAD }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );

  if (status === "skipped")
    return (
      <div style={{ ...base, border: "1px solid rgba(255,255,255,0.2)" }}>
        <div style={{ width: 8, height: 1.5, background: "rgba(255,255,255,0.3)" }} />
      </div>
    );

  if (status === "active")
    return (
      <div style={{ ...base, border: "2px solid rgba(255,255,255,0.8)" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
      </div>
    );

  return <div style={{ ...base, border: "1px solid rgba(255,255,255,0.1)" }} />;
}

// ── Category voting panel ─────────────────────────────────────────────────────
function CategoryPanel({
  category, index, total, selectedId, onSelect,
}: {
  category: Category;
  index: number;
  total: number;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const nominees = category.nominees;
  const gridClass =
    nominees.length === 1 ? "grid grid-cols-1 gap-5" :
    nominees.length === 2 ? "grid grid-cols-2 gap-5" :
    "grid grid-cols-2 sm:grid-cols-3 gap-4";
  const wrapperClass =
    nominees.length === 1 ? "max-w-xs mx-auto" :
    nominees.length === 2 ? "max-w-lg mx-auto" :
    "w-full";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.22 }}
    >
      {/* Header — floats directly on background */}
      <div className="mb-8">
        <p className="font-mono text-[10px] font-medium tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
          Category {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
        <div className="flex items-start justify-between gap-3 pt-7 lg:pt-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "white" }}>{category.name}</h1>
            <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>Select one candidate to vote</p>
          </div>
          {selectedId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5"
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                color: "#a5b4fc",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M1.5 4.5l2 2 4-4" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              SELECTED
            </motion.div>
          )}
        </div>
      </div>

      {/* Nominees — floats directly on background */}
      <div>
        {nominees.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>No nominees in this category yet.</p>
        ) : (
          <div className={wrapperClass}>
            <div className={gridClass}>
                {nominees.map((nominee, i) => {
                  const isSelected = selectedId === nominee.id;
                  return (
                    <motion.button
                      key={nominee.id}
                      type="button"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.22 }}
                      onClick={() => onSelect(nominee.id)}
                      className="group relative overflow-hidden focus:outline-none"
                      style={{
                        aspectRatio: "3/4",
                        display: "block",
                        outline: isSelected ? "2.5px solid #818cf8" : "1.5px solid rgba(255,255,255,0.08)",
                        outlineOffset: isSelected ? "3px" : "0px",
                        transition: "outline 0.15s ease, outline-offset 0.15s ease",
                      }}
                    >
                      {/* Full-bleed photo */}
                      <div className="absolute inset-0">
                        <Image
                          src={nominee.imageUrl}
                          alt={nominee.name}
                          fill
                          className={`object-cover transition-transform duration-500 ${isSelected ? "scale-[1.06]" : "group-hover:scale-[1.04]"}`}
                          sizes="(max-width: 640px) 45vw, 220px"
                        />
                      </div>

                      {/* Bottom gradient — name always readable */}
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)" }}
                      />

                      {/* Selected colour wash */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0"
                          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.22) 0%, transparent 60%)" }}
                        />
                      )}

                      {/* Check badge */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center z-10"
                          style={{ background: ACCENT_GRAD }}
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2 6.5l3.5 3.5 5.5-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}

                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-4 pt-10 z-10">
                        <p
                          className="font-mono text-xs font-bold leading-snug"
                          style={{ color: isSelected ? "#c7d2fe" : "rgba(255,255,255,0.93)", textShadow: "0 1px 6px rgba(0,0,0,0.9)", textTransform: "uppercase" }}
                        >
                          {nominee.name}
                        </p>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="font-mono font-semibold mt-0.5"
                              style={{ fontSize: 9, color: "#a5b4fc", letterSpacing: "0.12em" }}
                            >
                              YOUR VOTE
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

    </motion.div>
  );
}

// ── Review panel ──────────────────────────────────────────────────────────────
function ReviewPanel({
  categories, selected, skipped, votedCount,
  onEdit, onSubmit, isSubmitting, submitError, onBack,
}: {
  categories: Category[];
  selected: Record<string, string>;
  skipped: Record<string, true>;
  votedCount: number;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.22 }}
    >
      <div style={GLASS}>
        <div className="px-7 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 className="text-2xl font-bold" style={{ color: "white" }}>Review your votes</h1>
          <p className="font-mono text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {votedCount} voted · {Object.keys(skipped).length} skipped · {categories.length - votedCount - Object.keys(skipped).length} not visited
          </p>
        </div>

        <div className="divide-y overflow-y-auto" style={{ maxHeight: "52vh", borderColor: "rgba(255,255,255,0.05)" }}>
          {categories.map((cat, i) => {
            const choiceId = selected[cat.id];
            const choice = cat.nominees.find((n) => n.id === choiceId);
            const isSkipped = !!skipped[cat.id];
            return (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-7 py-3.5"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex-shrink-0 w-9 h-9 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  {choice ? (
                    <Image src={choice.imageUrl} alt={choice.name} width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div style={{ width: 12, height: 1.5, background: "rgba(255,255,255,0.15)" }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono truncate" style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>
                    {cat.name.toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold truncate mt-0.5" style={{ color: choice ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)" }}>
                    {choice?.name ?? (isSkipped ? "Skipped" : "—")}
                  </p>
                </div>
                <button
                  onClick={() => onEdit(i)}
                  className="text-xs flex-shrink-0 transition-colors"
                  style={{ color: "#818cf8", fontFamily: "var(--font-mono)" }}
                >
                  EDIT
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-7 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {submitError && (
            <p className="text-xs mb-4 px-3 py-2.5" style={{ color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {submitError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-sm font-medium transition-all duration-150 flex-shrink-0 px-4 py-2"
              style={{ color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              ← Back
            </button>
            <Button className="flex-1" disabled={votedCount < 1 || isSubmitting} isLoading={isSubmitting} onClick={onSubmit} style={BTN_STYLE}>
              Submit {votedCount} Vote{votedCount !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Already voted locked screen ──────────────────────────────────────────────
function AlreadyVotedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center px-6 max-w-sm mx-auto py-16"
    >
      <div
        className="w-16 h-16 flex items-center justify-center mb-6 flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">You&apos;ve already voted</h2>
      <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
        Your votes for the MTU Student Choice Awards 2026 have been recorded.
      </p>
      <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.22)" }}>
        Each student can only vote once. Results will be announced soon.
      </p>
      <button
        onClick={onLogout}
        className="px-6 py-2.5 text-xs font-mono tracking-widest text-white transition-opacity hover:opacity-75"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        END SESSION
      </button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VotePage() {
  const router = useRouter();
  const { selected, skipped, setVote, setSkip, clearAll } = useVotingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: voteStatus, isLoading: voteStatusLoading } = useQuery({
    queryKey: ["vote-status"],
    queryFn: async () => {
      const res = await fetch("/api/vote/status");
      if (!res.ok) return { hasVoted: false, voteCount: 0 };
      return res.json() as Promise<{ hasVoted: boolean; voteCount: number }>;
    },
    staleTime: Infinity,
  });

  const categories = useMemo(() => data ?? [], [data]);
  const total = categories.length;
  const currentCategory = categories[currentIndex];
  const currentVote = currentCategory ? selected[currentCategory.id] : undefined;
  const votedCount = Object.keys(selected).length;
  const skippedCount = Object.keys(skipped).length;

  const votePayload = useMemo(
    () =>
      categories
        .filter((c) => selected[c.id])
        .map((c) => ({ categoryId: c.id, contestantId: selected[c.id] })) as VotePayload[],
    [categories, selected]
  );

  const submitVotes = useMutation({
    mutationFn: async (votes: VotePayload[]) => {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votes }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Failed to submit votes");
      }
      return res.json();
    },
    onSuccess: (_data, votes) => { clearAll(); router.replace(`/success?votes=${votes.length}`); },
  });

  const getCategoryStatus = (catId: string, index: number): "voted" | "skipped" | "active" | "unvisited" => {
    if (selected[catId]) return "voted";
    if (skipped[catId]) return "skipped";
    if (index === currentIndex && !reviewMode) return "active";
    return "unvisited";
  };

  const goToCategory = (index: number) => {
    setCurrentIndex(index);
    setReviewMode(false);
    setShowDrawer(false);
  };

  const handleNext = () => {
    if (!currentVote) return;
    if (currentIndex + 1 >= total) { setReviewMode(true); return; }
    setCurrentIndex((i) => i + 1);
  };

  const handleSkip = () => {
    if (!currentCategory) return;
    setSkip(currentCategory.id);
    if (currentIndex + 1 >= total) { setReviewMode(true); return; }
    setCurrentIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (reviewMode) { setReviewMode(false); return; }
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAll();
    router.replace("/auth");
  }, [clearAll, router]);

  // Sidebar category list — shared between desktop and mobile drawer
  const CategoryList = ({ onSelect }: { onSelect: (i: number) => void }) => (
    <>
      {isLoading &&
        Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="mx-4 my-1 h-6 animate-pulse"
            style={{ background: "rgba(255,255,255,0.05)", width: `${70 + (i % 4) * 8}%` }}
          />
        ))}
      {categories.map((cat, i) => {
        const status = getCategoryStatus(cat.id, i);
        const isActive = i === currentIndex && !reviewMode;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(i)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150"
            style={{
              background: isActive ? "rgba(255,255,255,0.08)" : undefined,
              borderRight: isActive ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
            }}
          >
            <StatusDot status={status} />
            <span
              className="text-xs leading-snug flex-1 min-w-0"
              style={{
                color: isActive ? "white" : status === "voted" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                fontWeight: isActive ? 600 : 400,
                // Allow wrapping for long names instead of truncating
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden relative" style={{ background: PAGE_BG }}>
      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/3 w-72 h-72 opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />

      {/* ── Desktop sidebar — explicit width via style to avoid Tailwind conflicts ── */}
      <aside
        className="hidden lg:flex flex-col h-full z-10"
        style={{
          width: 260,
          minWidth: 260,
          background: "rgba(0,0,0,0.3)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <Image src="/general/src-logo.png" alt="MTU" width={28} height={28} className="object-contain" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">Student Choice Awards</p>
              <p className="font-mono mt-0.5" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>MTU 2026</p>
            </div>
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto py-2">
          <CategoryList onSelect={goToCategory} />
        </div>

        {/* Progress + submit */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-4">
            <CountdownTimer />
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {votedCount}/{total} voted
            </p>
            {skippedCount > 0 && (
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                {skippedCount} skipped
              </p>
            )}
          </div>
          <div className="h-0.5 mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-full"
              style={{ background: ACCENT_GRAD }}
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? (votedCount / total) * 100 : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <button
            onClick={() => setReviewMode(true)}
            disabled={votedCount < 1}
            className="w-full py-2.5 text-xs font-semibold text-white transition-opacity duration-150 disabled:opacity-25 disabled:cursor-not-allowed font-mono tracking-wide"
            style={{ background: votedCount >= 1 ? ACCENT_GRAD : "rgba(255,255,255,0.06)" }}
          >
            REVIEW & SUBMIT
          </button>
          <button
            onClick={handleLogout}
            className="w-full mt-2 py-2 text-xs font-mono tracking-wide transition-opacity duration-150 hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            END SESSION
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Image src="/general/src-logo.png" alt="MTU" width={22} height={22} className="object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">Student Choice Awards</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="font-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
              {reviewMode ? "REVIEW" : `${String(currentIndex + 1).padStart(2,"0")}/${String(total).padStart(2,"0")}`} · {votedCount} VOTED
            </p>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>·</span>
            <CountdownTimer compact />
          </div>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="text-xs px-2.5 py-1.5 flex-shrink-0 font-mono tracking-wide"
          style={{ color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          CATEGORIES
        </button>
        <button
          onClick={handleLogout}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.12)" }}
          title="End session"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M9 4l3 3-3 3M12 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-30"
              style={{ background: "rgba(0,0,0,0.7)" }}
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col"
              style={{ maxHeight: "78vh", background: "linear-gradient(180deg, #1c1840 0%, #0f0c29 100%)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-bold text-white">All Categories</p>
                <button onClick={() => setShowDrawer(false)} className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>CLOSE</button>
              </div>
              <div className="overflow-y-auto flex-1 py-2">
                <CategoryList onSelect={(i) => { goToCategory(i); setShowDrawer(false); }} />
              </div>
              <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <button
                  onClick={() => { setReviewMode(true); setShowDrawer(false); }}
                  disabled={votedCount < 1}
                  className="w-full py-2.5 text-xs font-semibold text-white disabled:opacity-25 font-mono tracking-wide"
                  style={{ background: votedCount >= 1 ? ACCENT_GRAD : "rgba(255,255,255,0.06)" }}
                >
                  REVIEW & SUBMIT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 h-full overflow-y-auto relative z-10 pt-16 lg:pt-0 pb-20">
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {(isLoading || voteStatusLoading) && (
          <div className="flex items-center justify-center w-full py-32">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.12)", borderTopColor: "rgba(255,255,255,0.7)" }}
            />
          </div>
        )}

        {/* Already voted — highest priority, shown regardless of category load state */}
        {!voteStatusLoading && voteStatus?.hasVoted && (
          <AlreadyVotedScreen onLogout={handleLogout} />
        )}

        {!isLoading && !voteStatusLoading && !voteStatus?.hasVoted && isError && (
          <div className="w-full max-w-lg mt-8 p-8 text-center" style={GLASS}>
            <p className="text-sm font-semibold text-white mb-1">Unable to load categories</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Please refresh and try again.</p>
          </div>
        )}

        {!isLoading && !voteStatusLoading && !voteStatus?.hasVoted && !isError && categories.length > 0 && (
          <div className="w-full max-w-3xl pb-8">
            <AnimatePresence mode="wait">
              {reviewMode ? (
                <ReviewPanel
                  key="review"
                  categories={categories}
                  selected={selected}
                  skipped={skipped}
                  votedCount={votedCount}
                  onEdit={goToCategory}
                  onSubmit={() => submitVotes.mutate(votePayload)}
                  isSubmitting={submitVotes.isPending}
                  submitError={submitVotes.error instanceof Error ? submitVotes.error.message : null}
                  onBack={() => setReviewMode(false)}
                />
              ) : currentCategory ? (
                <CategoryPanel
                  key={currentCategory.id}
                  category={currentCategory}
                  index={currentIndex}
                  total={total}
                  selectedId={currentVote}
                  onSelect={(id) => setVote(currentCategory.id, id)}
                />
              ) : null}
            </AnimatePresence>
          </div>
        )}
        </div>
      </main>

      {/* ── Fixed bottom navigation (category mode only) ── */}
      {!reviewMode && currentCategory && !voteStatus?.hasVoted && (
        <div
          className="fixed bottom-0 left-0 right-0 lg:left-[260px] z-20 flex items-center justify-between px-4 sm:px-6 py-3"
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-sm font-medium transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed px-4 py-2"
            style={{ color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="text-sm font-medium transition-all duration-150 px-4 py-2"
              style={{ color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              Skip
            </button>
            <Button onClick={handleNext} disabled={!currentVote} style={BTN_STYLE}>
              {currentIndex + 1 >= total ? "Review Votes" : "Next →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
