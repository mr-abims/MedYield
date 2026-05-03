"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Role,
  Submission,
  Bounty,
  DraftSubmission,
  SubmissionStatus,
} from "./types";

interface AddSubmissionInput {
  bounty: Bounty;
  walletAddress: string;
  txHash: string;
  ciphertextHash: string;
  rangeProof: string;
  status?: SubmissionStatus;
}

interface AppState {
  role: Role;
  // submissions are keyed by lowercase wallet address.
  submissionsByWallet: Record<string, Submission[]>;
  // draft saves keyed by `${wallet}:${bountyId}` (lowercase wallet).
  drafts: Record<string, DraftSubmission>;
  // org-created bounties (mock; in real life these come from chain).
  customBounties: Bounty[];

  setRole: (role: Role) => void;
  addSubmission: (input: AddSubmissionInput) => void;
  hasSubmitted: (wallet: string | undefined, bountyId: string) => boolean;
  getSubmissions: (wallet: string | undefined) => Submission[];

  saveDraft: (
    wallet: string | undefined,
    bountyId: string,
    values: Record<string, number | string>,
    step: number,
  ) => void;
  getDraft: (
    wallet: string | undefined,
    bountyId: string,
  ) => DraftSubmission | undefined;
  clearDraft: (wallet: string | undefined, bountyId: string) => void;

  addBounty: (b: Bounty) => void;
}

interface MinimalStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

function makeStorage(): MinimalStorage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  // Bind explicitly so zustand's persist middleware can call these without
  // losing `this` (some versions destructure the storage methods).
  return {
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, value);
      } catch {
        /* quota / private mode */
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}

const k = (wallet: string | undefined) =>
  (wallet ?? "").toLowerCase();

const dk = (wallet: string | undefined, bountyId: string) =>
  `${k(wallet)}:${bountyId}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      role: "patient",
      submissionsByWallet: {},
      drafts: {},
      customBounties: [],

      setRole: (role) => set({ role }),

      addSubmission: ({
        bounty,
        walletAddress,
        txHash,
        ciphertextHash,
        rangeProof,
        status = "paid",
      }) =>
        set((state) => {
          const key = k(walletAddress);
          if (!key) return state;
          const existing = state.submissionsByWallet[key] ?? [];
          // Idempotency: if a submission for this bounty already exists, no-op.
          if (existing.some((s) => s.bountyId === bounty.id)) return state;
          const now = Date.now();
          const sub: Submission = {
            bountyId: bounty.id,
            bountyTitle: bounty.title,
            org: bounty.org,
            date: new Date(now).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            timestamp: now,
            amount: bounty.pricePerRecord,
            status,
            walletAddress: key,
            txHash,
            ciphertextHash,
            rangeProof,
          };
          return {
            submissionsByWallet: {
              ...state.submissionsByWallet,
              [key]: [sub, ...existing],
            },
          };
        }),

      hasSubmitted: (wallet, bountyId) => {
        const key = k(wallet);
        if (!key) return false;
        const list = get().submissionsByWallet[key] ?? [];
        return list.some((s) => s.bountyId === bountyId);
      },

      getSubmissions: (wallet) => {
        const key = k(wallet);
        if (!key) return [];
        return get().submissionsByWallet[key] ?? [];
      },

      saveDraft: (wallet, bountyId, values, step) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [dk(wallet, bountyId)]: {
              bountyId,
              values,
              step,
              updatedAt: Date.now(),
            },
          },
        })),

      getDraft: (wallet, bountyId) => get().drafts[dk(wallet, bountyId)],

      clearDraft: (wallet, bountyId) =>
        set((state) => {
          const key = dk(wallet, bountyId);
          if (!(key in state.drafts)) return state;
          const next = { ...state.drafts };
          delete next[key];
          return { drafts: next };
        }),

      addBounty: (b) =>
        set((state) => ({
          customBounties: [b, ...state.customBounties],
        })),
    }),
    {
      name: "medyield-app-state",
      version: 2,
      storage: createJSONStorage(makeStorage),
      skipHydration: true,
      migrate: (persisted, version) => {
        // v1 → v2: drop legacy global submissions array; reset per-wallet store.
        if (version < 2) {
          return {
            role: "patient",
            submissionsByWallet: {},
            drafts: {},
            customBounties: [],
          };
        }
        return persisted as AppState;
      },
    },
  ),
);
