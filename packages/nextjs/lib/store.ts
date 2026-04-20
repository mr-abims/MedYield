"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role, Submission, Bounty } from "./types";

interface AppState {
  role: Role;
  submissions: Submission[];
  setRole: (role: Role) => void;
  addSubmission: (bounty: Bounty) => void;
  pendingCount: () => number;
}

const noopStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: "patient",
      submissions: [
        {
          bountyId: "seed-1",
          bountyTitle: "Hypertension Atlas",
          org: "Roche Ltd.",
          date: "Apr 15, 2026",
          amount: 4.0,
          status: "paid",
        },
        {
          bountyId: "seed-2",
          bountyTitle: "Metabolic Syndrome Study",
          org: "AstraZeneca",
          date: "Apr 10, 2026",
          amount: 2.5,
          status: "paid",
        },
      ],
      setRole: (role) => set({ role }),
      addSubmission: (bounty) =>
        set((state) => ({
          submissions: [
            {
              bountyId: bounty.id,
              bountyTitle: bounty.title,
              org: bounty.org,
              date: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              amount: bounty.pricePerRecord,
              status: "paid",
            },
            ...state.submissions,
          ],
        })),
      pendingCount: () =>
        get().submissions.filter((s) => s.status === "pending").length,
    }),
    {
      name: "medyield-app-state",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      skipHydration: true,
    },
  ),
);
