"use client";

import { useEffect, useState } from "react";

const FIELDS = [
  { label: "Age", plain: "47", enc: "0x3fa2…c1" },
  { label: "Systolic BP", plain: "128", enc: "0x9d4b…e8" },
  { label: "Smoker", plain: "No", enc: "0x1c77…a3" },
];

export function HeroEncryptViz() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const encrypted = tick % 3 !== 0;

  return (
    <div className="bg-surface rounded-[20px] border border-border p-7 w-[300px] flex-shrink-0 shadow-[0_8px_40px_rgba(28,25,23,0.08)]">
      <div className="flex items-center gap-2 mb-[18px]">
        <div
          className="w-2 h-2 rounded-full transition-colors duration-500"
          style={{ background: encrypted ? "#059669" : "#d97706" }}
        />
        <span className="text-[11px] font-semibold text-muted tracking-[0.06em] uppercase">
          {encrypted ? "Encrypted" : "Encrypting…"}
        </span>
      </div>
      {FIELDS.map((f) => (
        <div
          key={f.label}
          className="flex justify-between items-center px-3 py-[9px] rounded-lg mb-[6px] bg-bg border border-surface-subtle transition-colors"
        >
          <span className="text-xs font-medium text-foreground-soft">
            {f.label}
          </span>
          <span
            className={
              encrypted
                ? "font-mono text-[10px] text-accent tracking-wider transition-all"
                : "text-[13px] text-foreground font-semibold transition-all"
            }
          >
            {encrypted ? f.enc : f.plain}
          </span>
        </div>
      ))}
      <div className="mt-[14px] px-3 py-[10px] rounded-lg bg-accent-light flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1.5L2 3.75v3.5C2 10 4.4 12.5 7 13.2 9.6 12.5 12 10 12 7.25v-3.5L7 1.5z"
            fill="#059669"
            opacity="0.2"
            stroke="#059669"
            strokeWidth="1.2"
          />
          <path
            d="M4.5 7l2 2 3-3"
            stroke="#059669"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[11px] text-accent font-medium">
          Raw values never leave this browser
        </span>
      </div>
    </div>
  );
}
