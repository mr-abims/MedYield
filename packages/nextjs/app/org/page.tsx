export default function OrgDashboardPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-10">
        <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
          My bounties
        </div>
        <h1 className="font-display text-4xl font-medium text-foreground mb-2">
          Organization dashboard
        </h1>
        <p className="text-sm text-muted">
          Create bounties, monitor submissions, and trigger aggregate
          computations. Coming in the next pass.
        </p>
      </div>

      <div className="rounded-[14px] border border-dashed border-border bg-surface px-8 py-16 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <div className="font-display text-xl text-foreground mb-2">
          Org flows land in Pass 2
        </div>
        <p className="text-[13px] text-muted max-w-md mx-auto">
          The create-bounty wizard, active bounty list, and compute monitor are
          next on the roadmap. Switch to Patient to try the submit flow against
          live mock bounties.
        </p>
      </div>
    </div>
  );
}
