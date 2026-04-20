import type { BountyField } from "@/lib/types";

export function FieldPill({ field }: { field: BountyField }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-pill bg-surface-subtle text-[#6b6560] text-[11px] font-medium">
      {field.name}
    </span>
  );
}

export function VerifiedIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="#059669" />
      <path
        d="M4 7l2 2 4-4"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
