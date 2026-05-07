"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────
type CategoryTotal = {
  categoryId: string;
  title: string;
  order: number;
  totalVotes: number;
};

type Contestant = {
  id: string;
  name: string;
  imageUrl: string;
  votes: number;
  pct: number;
};

type VoterLogRow = {
  email: string;
  contestantName: string;
  votedAt: string;
};

type Detail = {
  category: { id: string; title: string };
  contestants: Contestant[];
  voterLog: VoterLogRow[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

function downloadCsv(voterLog: VoterLogRow[], categoryTitle: string) {
  const rows = [
    ["Email", "Voted For", "Time"],
    ...voterLog.map((r) => [r.email, r.contestantName, new Date(r.votedAt).toLocaleString()]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${categoryTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-votes.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // SSE — live category vote counts
  useEffect(() => {
    const es = new EventSource("/api/admin/live-results-stream");
    es.onopen = () => setIsConnected(true);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as CategoryTotal[];
        setCategoryTotals(data);
      } catch {}
    };
    es.onerror = () => { setIsConnected(false); es.close(); };
    return () => es.close();
  }, []);

  // Fetch detail for selected category
  const fetchDetail = useCallback(async (id: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/category-detail?id=${id}`, { signal: ctrl.signal });
      if (!res.ok) return;
      const data = (await res.json()) as Detail;
      setDetail(data);
    } catch {
      // aborted or network error
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDetail(null);
    void fetchDetail(id);
  };

  const handleRefresh = () => {
    if (selectedId) void fetchDetail(selectedId);
  };

  // Sorted sidebar: by vote count desc, then by order
  const sorted = [...categoryTotals].sort((a, b) =>
    b.totalVotes !== a.totalVotes ? b.totalVotes - a.totalVotes : a.order - b.order
  );

  const totalVotes = categoryTotals.reduce((s, c) => s + c.totalVotes, 0);
  const categoriesWithVotes = categoryTotals.filter((c) => c.totalVotes > 0).length;
  const totalCategories = categoryTotals.length;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: isConnected ? "#22c55e" : "#ef4444", boxShadow: isConnected ? "0 0 6px #22c55e" : "none" }}
          />
          <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {isConnected ? "LIVE" : "DISCONNECTED"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TOTAL VOTES", value: totalVotes.toLocaleString() },
            { label: "CATEGORIES ACTIVE", value: `${categoriesWithVotes} / ${totalCategories}` },
            { label: "LIVE UPDATES", value: isConnected ? "ON" : "OFF" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="px-4 py-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="font-mono text-[10px] tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                {kpi.label}
              </p>
              <p className="text-xl font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Split panel ───────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0 px-6 pb-6 lg:px-8">

        {/* Left — category sidebar */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden mr-4"
          style={{
            width: 272,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="font-mono text-[10px] tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              CATEGORIES — {sorted.length}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="h-3 w-3/4 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>
                ))
              : sorted.map((cat) => {
                  const isActive = selectedId === cat.categoryId;
                  return (
                    <button
                      key={cat.categoryId}
                      onClick={() => handleSelect(cat.categoryId)}
                      className="w-full text-left flex items-center justify-between px-4 py-3 transition-all duration-150"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                        borderLeft: isActive ? "2px solid #6366f1" : "2px solid transparent",
                      }}
                    >
                      <span
                        className="text-xs leading-snug pr-2"
                        style={{
                          color: isActive ? "#c7d2fe" : "rgba(255,255,255,0.65)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {cat.title}
                      </span>
                      {cat.totalVotes > 0 && (
                        <span
                          className="flex-shrink-0 font-mono text-[10px] font-bold px-1.5 py-0.5 min-w-[28px] text-center"
                          style={{
                            background: isActive ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)",
                            color: isActive ? "#c7d2fe" : "rgba(255,255,255,0.5)",
                          }}
                        >
                          {cat.totalVotes}
                        </span>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Right — detail panel */}
        <div
          className="flex-1 min-w-0 flex flex-col overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(0,0,0,0.15)" }}>
              <div style={{ color: "rgba(255,255,255,0.15)" }}>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="2" y="10" width="36" height="20" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="2" y1="17" x2="38" y2="17" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="12" y1="10" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
                SELECT A CATEGORY
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col h-full overflow-hidden"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                {/* Detail header */}
                <div
                  className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 gap-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.2)" }}
                >
                  <h2 className="text-sm font-bold text-white truncate">
                    {detail?.category.title ?? categoryTotals.find((c) => c.categoryId === selectedId)?.title ?? "…"}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {detail && (
                      <button
                        onClick={() => downloadCsv(detail.voterLog, detail.category.title)}
                        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide transition-opacity hover:opacity-80"
                        style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 1v6M2 7l3 2 3-2M1 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        CSV
                      </button>
                    )}
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] tracking-wide transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <svg
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                        className={isRefreshing ? "animate-spin" : ""}
                        style={{ transformOrigin: "center" }}
                      >
                        <path d="M9 5A4 4 0 1 1 5 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M9 1v4H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      REFRESH
                    </button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  {!detail ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Loading…</div>
                    </div>
                  ) : (
                    <>
                      {/* Contestant standings */}
                      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {detail.contestants.length === 0 ? (
                          <p className="text-xs text-center py-6" style={{ color: "rgba(255,255,255,0.2)" }}>No nominees in this category.</p>
                        ) : (
                          <div className="space-y-3">
                            {detail.contestants.map((c, i) => (
                              <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.2 }}
                                className="flex items-center gap-3"
                              >
                                {/* Rank */}
                                <span
                                  className="font-mono text-[10px] font-bold flex-shrink-0 w-5 text-center"
                                  style={{ color: i === 0 ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
                                >
                                  #{i + 1}
                                </span>

                                {/* Photo */}
                                <div className="w-9 h-9 flex-shrink-0 overflow-hidden" style={{ outline: i === 0 ? "1.5px solid #fbbf24" : "1.5px solid rgba(255,255,255,0.1)", outlineOffset: "2px" }}>
                                  <Image
                                    src={c.imageUrl}
                                    alt={c.name}
                                    width={36}
                                    height={36}
                                    className="object-cover w-full h-full"
                                  />
                                </div>

                                {/* Name + bar */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <span
                                      className="text-xs font-semibold truncate"
                                      style={{ color: i === 0 ? "#fef3c7" : "rgba(255,255,255,0.8)" }}
                                    >
                                      {c.name}
                                    </span>
                                    <span
                                      className="font-mono text-xs flex-shrink-0"
                                      style={{ color: i === 0 ? "#fbbf24" : "rgba(255,255,255,0.35)" }}
                                    >
                                      {c.votes} {c.votes === 1 ? "vote" : "votes"}
                                    </span>
                                  </div>
                                  <div className="h-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <motion.div
                                      className="h-full"
                                      style={{ background: i === 0 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${c.pct}%` }}
                                      transition={{ duration: 0.5, delay: i * 0.04 }}
                                    />
                                  </div>
                                </div>

                                {/* % */}
                                <span
                                  className="font-mono text-[10px] flex-shrink-0 w-8 text-right"
                                  style={{ color: "rgba(255,255,255,0.25)" }}
                                >
                                  {c.pct}%
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Voter log */}
                      <div className="px-5 py-4">
                        <p className="font-mono text-[10px] tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                          VOTER LOG — {detail.voterLog.length}
                        </p>

                        {detail.voterLog.length === 0 ? (
                          <p className="text-xs py-4 text-center" style={{ color: "rgba(255,255,255,0.2)" }}>No votes cast yet.</p>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                {["Email", "Voted For", "Time"].map((h) => (
                                  <th
                                    key={h}
                                    className="text-left pb-2 font-mono text-[10px] tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.25)" }}
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {detail.voterLog.map((row, i) => (
                                <motion.tr
                                  key={i}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: i * 0.02 }}
                                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                >
                                  <td className="py-2.5 pr-4 text-xs" style={{ color: "rgba(255,255,255,0.55)", maxWidth: 200 }}>
                                    <span className="block truncate">{row.email}</span>
                                  </td>
                                  <td className="py-2.5 pr-4 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
                                    {row.contestantName}
                                  </td>
                                  <td className="py-2.5 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    {timeAgo(row.votedAt)}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
