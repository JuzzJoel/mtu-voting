"use client";

import { create } from "zustand";

type Contestant = { id: string; name: string; imageUrl: string };
type Category = { id: string; title: string; contestants: Contestant[] };

type VotingState = {
  categories: Category[];
  selected: Record<string, string>;
  loading: boolean;
  setCategories: (cats: Category[]) => void;
  selectContestant: (categoryId: string, contestantId: string) => void;
  removeCategoryAfterVote: (categoryId: string) => void;
  setLoading: (loading: boolean) => void;
};

export const useVotingStore = create<VotingState>((set) => ({
  categories: [],
  selected: {},
  loading: false,
  setCategories: (categories) => set({ categories }),
  selectContestant: (categoryId, contestantId) =>
    set((state) => ({ selected: { ...state.selected, [categoryId]: contestantId } })),
  removeCategoryAfterVote: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
      selected: Object.fromEntries(Object.entries(state.selected).filter(([key]) => key !== categoryId))
    })),
  setLoading: (loading) => set({ loading })
}));
