"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAppStore } from "@/lib/store";
import { BOUNTIES } from "@/lib/bounties";
import type { Bounty } from "@/lib/types";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { VerifiedIcon } from "@/components/marketplace/FieldPill";
import { arbiscanAddress, formatDeadline, truncateAddress } from "@/lib/utils";

export default function OrgDashboardPage() {
  const { isConnected } = useAccount();
  const customBounties = useAppStore((s) => s.customBounties);

  // For demo: show two seed bounties as "your portfolio" so the dashboard
  // isn't empty in fresh sessions. Custom (user-created) bounties appear first.
  const myBounties = useMemo<Bounty[]>(
    () => [...customBounties, ...BOUNTIES.slice(0, 2)],
    [customBounties],
  );

  const totals = useMemo(() => {
    let escrow = 0;
    let used = 0;
    let validated = 0;
    let active = 0;
    for (const b of myBounties) {
      escrow += b.escrow;
      used += b.escrowUsed;
      validated += b.validatedSubmissions;
      if (b.status === "OPEN") active++;
    }
    return { escrow, used, validated, active };
  }, [myBounties]);

  if (!isConnected) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          For organizations
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-2">
          Connect to manage your bounties
        </h1>
        <p className="text-sm text-muted mb-7 leading-[1.7]">
          Connect a wallet on Arbitrum Sepolia to deploy a bounty escrow,
          monitor encrypted submissions, and trigger aggregate computations
          when your cohort fills.
        </p>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="px-7 py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity tracking-wide"
            >
              Connect wallet →
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8 sm:mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
            My bounties
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-2">
            Organization dashboard
          </h1>
          <p className="text-sm text-muted">
            Create bounties, monitor encrypted submissions, and trigger
            aggregate computations.
          </p>
        </div>
        <Link
          href="/org/create"
          className="px-5 py-3 rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + New bounty
        </Link>
      </div>

      {/* Portfolio stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Active bounties"
          value={totals.active.toString()}
          highlight
        />
        <StatCard
          label="Escrow funded"
          value={`$${totals.escrow.toLocaleString()}`}
        />
        <StatCard
          label="Escrow used"
          value={`$${totals.used.toLocaleString()}`}
        />
        <StatCard
          label="Validated records"
          value={totals.validated.toLocaleString()}
        />
      </div>

      {myBounties.length === 0 ? (
        <EmptyOrgState />
      ) : (
        <div className="flex flex-col gap-3">
          {myBounties.map((b) => (
            <OrgBountyRow key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-4 py-3.5 rounded-[12px] ${
        highlight
          ? "bg-accent-light"
          : "bg-surface border border-border shadow-card"
      }`}
    >
      <div
        className={`font-display text-2xl font-medium ${
          highlight ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-muted mt-0.5">{label}</div>
    </div>
  );
}

function OrgBountyRow({ bounty }: { bounty: Bounty }) {
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);
  const cohortFill = Math.round(
    (bounty.validatedSubmissions / bounty.maxSubmissions) * 100,
  );
  const minMet = bounty.validatedSubmissions >= bounty.minSubmissions;

  return (
    <div className="bg-surface rounded-[14px] border border-border p-5 sm:p-6 shadow-card">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-muted">
              {bounty.org}
            </span>
            {bounty.verified && <VerifiedIcon />}
            <StatusBadge status={bounty.status} fillPct={fillPct} />
          </div>
          <div className="font-display text-lg font-medium text-foreground">
            {bounty.title}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Link
            href={`/marketplace/${bounty.id}`}
            className="px-3 py-2 rounded-lg border-[1.5px] border-border text-[12px] text-muted hover:border-accent hover:text-accent transition-colors"
          >
            View
          </Link>
          <button
            disabled={!minMet}
            title={
              minMet
                ? "Trigger the aggregate computation"
                : `Needs ${bounty.minSubmissions - bounty.validatedSubmissions} more submissions`
            }
            className="px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:bg-surface-subtle disabled:text-muted disabled:cursor-not-allowed"
          >
            Run compute
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Mini label="Per record" value={`$${bounty.pricePerRecord.toFixed(2)}`} />
        <Mini
          label="Validated"
          value={`${bounty.validatedSubmissions} / ${bounty.maxSubmissions}`}
        />
        <Mini label="Closes" value={formatDeadline(bounty.deadline)} />
        <Mini
          label="Escrow left"
          value={`$${(bounty.escrow - bounty.escrowUsed).toLocaleString()}`}
        />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-placeholder">
            {cohortFill}% of cohort
          </span>
          <span className="text-[11px] text-placeholder">
            min {bounty.minSubmissions.toLocaleString()} for compute
          </span>
        </div>
        <div className="h-[5px] bg-surface-subtle rounded-[3px] overflow-hidden">
          <div
            className="h-full bg-accent rounded-[3px]"
            style={{ width: `${Math.min(cohortFill, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-[11px] text-placeholder">
        Contract:{" "}
        <a
          href={arbiscanAddress(bounty.contractAddress)}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-accent hover:underline"
        >
          {truncateAddress(bounty.contractAddress, 6, 6)} ↗
        </a>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 rounded-[10px] bg-bg border border-border">
      <div className="text-[10px] text-placeholder uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className="text-[13px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function EmptyOrgState() {
  return (
    <div className="rounded-[14px] border border-dashed border-border bg-surface px-6 sm:px-8 py-12 sm:py-16 text-center">
      <div className="font-display text-xl text-foreground mb-2">
        No bounties yet
      </div>
      <p className="text-[13px] text-muted max-w-md mx-auto mb-5">
        Define the data you need and the computation you want to run, fund the
        escrow, and patients can start submitting encrypted data within
        minutes.
      </p>
      <Link
        href="/org/create"
        className="inline-block px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
      >
        Create your first bounty →
      </Link>
    </div>
  );
}
