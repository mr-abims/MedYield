"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { BOUNTIES, findBounty } from "@/lib/bounties";
import { useAppStore } from "@/lib/store";
import { useNow } from "@/hooks/useNow";
import { SubmitDrawer } from "@/components/submit/SubmitDrawer";
import { StatusBadge } from "@/components/marketplace/StatusBadge";
import { VerifiedIcon } from "@/components/marketplace/FieldPill";
import {
  arbiscanAddress,
  cn,
  formatCountdown,
  truncateAddress,
} from "@/lib/utils";

export default function BountyDetailPage() {
  const params = useParams<{ id: string }>();
  const customBounties = useAppStore((s) => s.customBounties);
  const submissionsByWallet = useAppStore((s) => s.submissionsByWallet);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const bounty = useMemo(
    () => findBounty(params.id, customBounties),
    [params.id, customBounties],
  );

  const [open, setOpen] = useState(false);
  const now = useNow();

  if (!bounty) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          Not found
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-2">
          This bounty doesn&apos;t exist.
        </h1>
        <p className="text-sm text-muted mb-6 leading-[1.7]">
          It may have been deleted, or the link is wrong. Browse open bounties
          to find another study.
        </p>
        <Link
          href="/marketplace"
          className="inline-block px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          Browse marketplace →
        </Link>
      </div>
    );
  }

  const submissions = address
    ? submissionsByWallet[address.toLowerCase()] ?? []
    : [];
  const submitted = submissions.find((s) => s.bountyId === bounty.id);
  const fillPct = Math.round((bounty.escrowUsed / bounty.escrow) * 100);
  const expired = now > 0 && bounty.deadline <= now;
  const slotsLeft = bounty.maxSubmissions - bounty.validatedSubmissions;
  const wrongNetwork = isConnected && chainId !== arbitrumSepolia.id;
  const isSubmittable =
    bounty.status === "OPEN" && !expired && slotsLeft > 0 && !submitted;

  const seedIndex = BOUNTIES.findIndex((b) => b.id === bounty.id);
  const isCustom = seedIndex === -1;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors mb-5"
      >
        ← Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-[13px] font-semibold text-muted">
              {bounty.org}
            </span>
            {bounty.verified && (
              <span
                title="Verified organization — KYB-checked by MedYield"
                className="inline-flex items-center gap-1 px-2 py-[3px] rounded-pill bg-accent-light text-accent text-[10px] font-bold tracking-[0.06em]"
              >
                <VerifiedIcon /> VERIFIED
              </span>
            )}
            <StatusBadge status={bounty.status} fillPct={fillPct} />
            {isCustom && (
              <span className="px-2 py-[3px] rounded-pill bg-accent-violet-light text-accent-violet text-[10px] font-bold tracking-[0.06em]">
                YOUR BOUNTY
              </span>
            )}
          </div>

          <h1 className="font-display text-[32px] sm:text-[40px] font-medium text-foreground leading-[1.15] mb-3">
            {bounty.title}
          </h1>
          <p className="text-[15px] text-muted leading-[1.7] mb-7 max-w-[640px]">
            {bounty.description}
          </p>

          <Section title="Data requested">
            <div className="flex flex-col gap-2">
              {bounty.fields.map((f) => (
                <div
                  key={f.name}
                  className="flex justify-between items-center px-4 py-3 rounded-[10px] bg-surface border border-border"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-placeholder mt-0.5 capitalize">
                      {f.type} · encrypted client-side
                    </div>
                  </div>
                  <span className="text-[13px] font-mono text-muted">
                    {f.type === "boolean"
                      ? "Yes / No"
                      : `${f.min}–${f.max} ${f.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Computation that will run on your data">
            <div className="rounded-[12px] border border-border bg-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-[3px] rounded-pill bg-accent-light text-accent text-[10px] font-bold tracking-[0.08em] uppercase">
                  {bounty.computation.op.replace("-", " ")}
                </span>
                <span className="text-[11px] text-placeholder">
                  Template: {bounty.templateLabel}
                </span>
              </div>
              <div className="text-[13px] text-foreground mb-2 font-medium">
                {bounty.computation.outputLabel}
              </div>
              <div className="text-[12px] text-muted leading-[1.55] mb-3">
                {bounty.computation.resultPolicy}
              </div>
              <div className="text-[12px] text-foreground-soft leading-[1.6] border-t border-border pt-3">
                {bounty.computeDescription}
              </div>
            </div>
          </Section>

          <Section title="On-chain transparency">
            <div className="rounded-[12px] border border-border bg-surface p-5 grid sm:grid-cols-2 gap-4">
              <KeyVal label="Escrow contract">
                <a
                  href={arbiscanAddress(bounty.contractAddress)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[12px] text-accent hover:underline break-all"
                >
                  {truncateAddress(bounty.contractAddress, 6, 6)} ↗
                </a>
              </KeyVal>
              <KeyVal label="Network">Arbitrum Sepolia</KeyVal>
              <KeyVal label="Escrow funded">
                ${bounty.escrow.toLocaleString()} USDC
              </KeyVal>
              <KeyVal label="Escrow remaining">
                ${(bounty.escrow - bounty.escrowUsed).toLocaleString()} USDC
              </KeyVal>
              <KeyVal label="Validated submissions">
                {bounty.validatedSubmissions.toLocaleString()} /{" "}
                {bounty.maxSubmissions.toLocaleString()}
              </KeyVal>
              <KeyVal label="Min for compute">
                {bounty.minSubmissions.toLocaleString()}
              </KeyVal>
            </div>
          </Section>
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-[80px] lg:self-start">
          <div className="rounded-[16px] border border-border bg-surface p-5 sm:p-6 shadow-card">
            <div className="font-display text-3xl font-semibold text-accent mb-1">
              ${bounty.pricePerRecord.toFixed(2)}
            </div>
            <div className="text-[12px] text-placeholder mb-5">
              Paid in USDC the moment your record passes the range check.
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <Stat label="Closes in" value={formatCountdown(bounty.deadline)} />
              <Stat
                label="Slots left"
                value={Math.max(slotsLeft, 0).toLocaleString()}
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] text-placeholder">
                  {fillPct}% of escrow used
                </span>
                <span className="text-[11px] text-placeholder">
                  {bounty.validatedSubmissions.toLocaleString()} validated
                </span>
              </div>
              <div className="h-[6px] bg-surface-subtle rounded-[3px] overflow-hidden">
                <div
                  className="h-full bg-accent rounded-[3px] transition-all duration-500"
                  style={{ width: `${Math.min(fillPct, 100)}%` }}
                />
              </div>
            </div>

            <PreflightPanel
              submitted={!!submitted}
              expired={expired}
              slotsLeft={slotsLeft}
              wrongNetwork={wrongNetwork}
              isConnected={isConnected}
            />

            <button
              onClick={() => setOpen(true)}
              disabled={!isSubmittable}
              className={cn(
                "w-full mt-5 py-[13px] rounded-[10px] text-sm font-semibold transition-opacity tracking-wide",
                isSubmittable
                  ? "bg-accent text-white hover:opacity-90"
                  : "bg-surface-subtle text-muted cursor-not-allowed",
              )}
            >
              {submitted
                ? "Already contributed ✓"
                : expired
                  ? "Bounty closed"
                  : slotsLeft <= 0
                    ? "Cohort full"
                    : "Submit my data →"}
            </button>

            {submitted && submitted.txHash && (
              <Link
                href="/earnings"
                className="block w-full mt-2.5 py-[11px] rounded-[10px] border-[1.5px] border-border text-center text-[13px] text-foreground-soft hover:border-accent hover:text-accent transition-colors"
              >
                View in earnings →
              </Link>
            )}
          </div>
        </aside>
      </div>

      <SubmitDrawer
        bounty={open ? bounty : null}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="text-[11px] font-bold tracking-[0.08em] text-placeholder mb-3 uppercase">
        {title}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3.5 py-3 rounded-[10px] bg-bg border border-border text-center">
      <div className="font-display text-lg font-medium text-foreground">
        {value}
      </div>
      <div className="text-[11px] text-placeholder mt-0.5">{label}</div>
    </div>
  );
}

function KeyVal({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] tracking-wide text-placeholder uppercase mb-1">
        {label}
      </div>
      <div className="text-[13px] text-foreground">{children}</div>
    </div>
  );
}

function PreflightPanel({
  submitted,
  expired,
  slotsLeft,
  wrongNetwork,
  isConnected,
}: {
  submitted: boolean;
  expired: boolean;
  slotsLeft: number;
  wrongNetwork: boolean;
  isConnected: boolean;
}) {
  const items: { tone: "ok" | "warn" | "block"; text: string }[] = [];
  if (!isConnected) {
    items.push({ tone: "warn", text: "Connect your wallet to submit." });
  } else if (wrongNetwork) {
    items.push({
      tone: "block",
      text: "Switch to Arbitrum Sepolia to submit.",
    });
  } else {
    items.push({ tone: "ok", text: "Wallet connected on Arbitrum Sepolia." });
  }

  if (submitted) {
    items.push({
      tone: "block",
      text: "You've already contributed to this bounty.",
    });
  } else if (expired) {
    items.push({ tone: "block", text: "Submission deadline has passed." });
  } else if (slotsLeft <= 0) {
    items.push({ tone: "block", text: "Cohort is already full." });
  } else if (slotsLeft <= 25) {
    items.push({
      tone: "warn",
      text: `Only ${slotsLeft} ${slotsLeft === 1 ? "slot" : "slots"} left.`,
    });
  }

  return (
    <div className="rounded-[10px] border border-border bg-bg p-3 flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span
            className={cn(
              "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
              item.tone === "ok" && "bg-accent",
              item.tone === "warn" && "bg-[#d97706]",
              item.tone === "block" && "bg-[#ef4444]",
            )}
          />
          <span
            className={cn(
              "text-[12px] leading-[1.4]",
              item.tone === "ok" && "text-foreground-soft",
              item.tone === "warn" && "text-[#92400e]",
              item.tone === "block" && "text-[#991b1b]",
            )}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
