'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Contestant = {
  id: string
  name: string
  imageUrl: string
  description?: string | null
}
type Category = { id: string; title: string; contestants: Contestant[] }

type VotingState = {
  categories: Category[]
  selected: Record<string, string>
  loading: boolean
  setCategories: (cats: Category[]) => void
  setVote: (categoryId: string, contestantId: string) => void
  clearVote: (categoryId: string) => void
  clearAll: () => void
  setLoading: (loading: boolean) => void
}

export const useVotingStore = create<VotingState>()(
  persist(
    (set) => ({
      categories: [],
      selected: {},
      loading: false,
      setCategories: (categories) => set({ categories }),
      setVote: (categoryId, contestantId) =>
        set((state) => ({
          selected: { ...state.selected, [categoryId]: contestantId },
        })),
      clearVote: (categoryId) =>
        set((state) => ({
          selected: Object.fromEntries(
            Object.entries(state.selected).filter(([key]) => key !== categoryId)
          ),
        })),
      clearAll: () => set({ selected: {} }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'mtu-votes',
      partialize: (state) => ({ selected: state.selected }),
    }
  )
)
