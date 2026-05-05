"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui";

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

    eventSource.onopen = () => {
      setIsConnected(true);
    };

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
      console.error("SSE connection error");
      setIsConnected(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const totalVotes = totals.reduce((sum, row) => sum + row.votes, 0);
  const topCandidates = [...totals].sort((a, b) => b.votes - a.votes).slice(0, 5);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 py-12 sm:px-6 lg:px-8 mb-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-accent-lime" : "bg-accent-red"} animate-pulse`} />
            <span className="text-caption font-semibold text-neutral-text-secondary">
              {isConnected ? "Live Connection" : "Offline"}
            </span>
          </div>
          <h1 className="text-h1 font-heading font-bold text-primary-green mb-3">
            Live Results
          </h1>
          <p className="text-body-lg text-neutral-text-secondary">
            Real-time voting analytics across all categories
          </p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Votes", value: totalVotes.toLocaleString(), color: "primary-green" },
            { label: "Categories", value: new Set(totals.map(t => t.categoryTitle)).size, color: "primary-purple" },
            { label: "Candidates", value: totals.length, color: "accent-violet" }
          ].map((kpi, idx) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card variant="dark" className="p-6 sm:p-8">
                <div className="text-body-sm text-neutral-text-secondary mb-2">{kpi.label}</div>
                <div className={`text-3xl font-bold font-heading text-${kpi.color}`}>
                  {kpi.value}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Candidates */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="dark" className="p-6 sm:p-8">
              <h2 className="text-h3 font-heading font-bold text-neutral-text-primary mb-6">
                🏆 Top Candidates
              </h2>
              <div className="space-y-4">
                {topCandidates.map((candidate, idx) => (
                  <div
                    key={`${candidate.categoryTitle}-${candidate.contestantName}`}
                    className="pb-4 border-b border-neutral-border last:border-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body-sm font-semibold text-neutral-text-primary">
                          #{idx + 1} {candidate.contestantName}
                        </p>
                        <p className="text-caption text-neutral-text-secondary">
                          {candidate.categoryTitle}
                        </p>
                      </div>
                      <div className="text-h3 font-bold text-primary-green">
                        {candidate.votes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* All Results Table */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card variant="dark" className="p-6 sm:p-8">
              <h2 className="text-h3 font-heading font-bold text-neutral-text-primary mb-6">
                📊 Complete Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-body-sm">
                  <thead className="border-b border-neutral-border">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Category</th>
                      <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Contestant</th>
                      <th className="text-right py-3 px-3 font-semibold text-neutral-text-secondary">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.map((row, i) => (
                      <tr key={`${row.categoryTitle}-${row.contestantName}-${i}`} className="border-b border-neutral-border/50 hover:bg-neutral-surface-dark/50 transition-colors">
                        <td className="py-3 px-3 text-neutral-text-secondary">{row.categoryTitle}</td>
                        <td className="py-3 px-3 text-neutral-text-primary font-semibold">{row.contestantName}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-block px-3 py-1 rounded-lg bg-primary-green/20 text-primary-green font-semibold">
                            {row.votes}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          <Card variant="dark" className="p-6 sm:p-8">
            <h2 className="text-h3 font-heading font-bold text-neutral-text-primary mb-6">
              📈 Breakdown by Level & Department
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm">
                <thead className="border-b border-neutral-border">
                  <tr>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Category</th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Candidate</th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Level</th>
                    <th className="text-left py-3 px-3 font-semibold text-neutral-text-secondary">Department</th>
                    <th className="text-right py-3 px-3 font-semibold text-neutral-text-secondary">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row, i) => (
                    <tr key={i} className="border-b border-neutral-border/50 hover:bg-neutral-surface-dark/50 transition-colors">
                      <td className="py-3 px-3 text-neutral-text-secondary text-body-sm">{String(row.category)}</td>
                      <td className="py-3 px-3 text-neutral-text-primary font-semibold text-body-sm">{String(row.contestant)}</td>
                      <td className="py-3 px-3 text-neutral-text-secondary text-body-sm">{row.level ? String(row.level) : "—"}</td>
                      <td className="py-3 px-3 text-neutral-text-secondary text-body-sm">{row.department ? String(row.department) : "—"}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-3 py-1 rounded-lg bg-primary-purple/20 text-primary-purple font-semibold">
                          {Number(row.votes)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
