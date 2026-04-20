import Link from "next/link";

export function Logo({ size = 26 }: { size?: number }) {
  const height = Math.round((size * 30) / 26);
  return (
    <Link
      href="/"
      className="flex items-center gap-[9px] select-none flex-shrink-0"
    >
      <svg
        width={size}
        height={height}
        viewBox="0 0 44 50"
        fill="none"
        aria-hidden
      >
        <path
          d="M22 2L3 9.5v14C3 34.8 11.4 44.8 22 48 32.6 44.8 41 34.8 41 23.5v-14L22 2z"
          fill="#059669"
          fillOpacity="0.15"
          stroke="#059669"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M22 34V18"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 24l6-6 6 6"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="38" r="2" fill="#059669" opacity="0.4" />
        <circle cx="22" cy="40.5" r="2" fill="#059669" opacity="0.4" />
        <circle cx="29" cy="38" r="2" fill="#059669" opacity="0.4" />
      </svg>
      <span className="font-display text-[18px] font-medium text-foreground tracking-tight">
        Med<span className="text-accent">Yield</span>
      </span>
    </Link>
  );
}
