'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type VotingState = {
  selected: Record<string, string>
  skipped: Record<string, true>
  setVote: (categoryId: string, contestantId: string) => void
  setSkip: (categoryId: string) => void
  clearAll: () => void
}

export const useVotingStore = create<VotingState>()(
  persist(
    (set) => ({
      selected: {},
      skipped: {},
      setVote: (categoryId, contestantId) =>
        set((state) => ({
          selected: { ...state.selected, [categoryId]: contestantId },
          // voting on a skipped category un-skips it
          skipped: Object.fromEntries(
            Object.entries(state.skipped).filter(([k]) => k !== categoryId)
          ) as Record<string, true>,
        })),
      setSkip: (categoryId) =>
        set((state) => ({
          skipped: { ...state.skipped, [categoryId]: true },
          // skipping a voted category removes the vote
          selected: Object.fromEntries(
            Object.entries(state.selected).filter(([k]) => k !== categoryId)
          ),
        })),
      clearAll: () => set({ selected: {}, skipped: {} }),
    }),
    {
      name: 'mtu-votes',
      partialize: (state) => ({ selected: state.selected, skipped: state.skipped }),
    }
  )
)
