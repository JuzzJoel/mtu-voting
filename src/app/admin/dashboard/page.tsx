"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Totals = {
  categoryTitle: string;
  contestantName: string;
  votes: number;
};

export default function AdminDashboardPage() {
  const [totals, setTotals] = useState<Totals[]>([]);
  const [breakdown, setBreakdown] = useState<Array<Record<string, string | number | null>>>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/admin/live-results-stream");
    eventSource.onopen = () => setIsConnected(true);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTotals(data.totals ?? []);
        setBreakdown(data.byLevelDepartment ?? []);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };
    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };
    return () => eventSource.close();
  }, []);

  const totalVotes = totals.reduce((sum, row) => sum + row.votes, 0);
  const topCandidates = [...totals].sort((a, b) => b.votes - a.votes).slice(0, 5);
  const categoryCount = new Set(totals.map((t) => t.categoryTitle)).size;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-400"} animate-pulse`} />
          <span className="text-xs text-gray-500">{isConnected ? "Live" : "Offline"}</span>
        </div>
        <h1 className="text-xl font-bold text-black">Live Results</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time voting data across all categories</p>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Votes", value: totalVotes.toLocaleString() },
          { label: "Categories", value: categoryCount },
          { label: "Candidates", value: totals.length },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="border border-gray-200 bg-white p-5"
          >
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-black">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Results grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Top candidates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 bg-white"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-black">Top Candidates</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topCandidates.map((candidate, i) => (
              <div key={`${candidate.categoryTitle}-${candidate.contestantName}`} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-black">
                    #{i + 1} {candidate.contestantName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{candidate.categoryTitle}</p>
                </div>
                <span className="text-sm font-bold text-black">{candidate.votes}</span>
              </div>
            ))}
            {topCandidates.length === 0 && (
              <p className="px-5 py-4 text-xs text-gray-400">No data yet.</p>
            )}
          </div>
        </motion.div>

        {/* All results table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 border border-gray-200 bg-white"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-black">All Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Category</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Contestant</th>
                  <th className="text-right py-3 px-5 font-semibold text-gray-500">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {totals.map((row, i) => (
                  <tr key={`${row.categoryTitle}-${row.contestantName}-${i}`} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-5 text-gray-500">{row.categoryTitle}</td>
                    <td className="py-3 px-5 font-semibold text-black">{row.contestantName}</td>
                    <td className="py-3 px-5 text-right font-bold text-black">{row.votes}</td>
                  </tr>
                ))}
                {totals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 px-5 text-center text-xs text-gray-400">No data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Breakdown table */}
      {breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border border-gray-200 bg-white"
        >
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-black">Breakdown by Level & Department</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Category</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Candidate</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Level</th>
                  <th className="text-left py-3 px-5 font-semibold text-gray-500">Department</th>
                  <th className="text-right py-3 px-5 font-semibold text-gray-500">Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {breakdown.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-5 text-gray-500">{String(row.category)}</td>
                    <td className="py-3 px-5 font-semibold text-black">{String(row.contestant)}</td>
                    <td className="py-3 px-5 text-gray-500">{row.level ? String(row.level) : "—"}</td>
                    <td className="py-3 px-5 text-gray-500">{row.department ? String(row.department) : "—"}</td>
                    <td className="py-3 px-5 text-right font-bold text-black">{Number(row.votes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
