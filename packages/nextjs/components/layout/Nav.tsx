"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppStore } from "@/lib/store";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; showBadge?: boolean };

const PATIENT_LINKS: NavLink[] = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/earnings", label: "My Earnings", showBadge: true },
];

const ORG_LINKS: NavLink[] = [
  { href: "/org", label: "My Bounties" },
  { href: "/org/create", label: "New Bounty" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const { address } = useAccount();
  const pendingCount = useAppStore((s) => {
    if (!address) return 0;
    const list = s.submissionsByWallet[address.toLowerCase()] ?? [];
    return list.filter((x) => x.status === "pending").length;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const isLanding = pathname === "/";
  const links = role === "org" ? ORG_LINKS : PATIENT_LINKS;

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    router.push(next === "org" ? "/org" : "/marketplace");
  };

  if (isLanding) {
    return (
      <nav className="absolute top-0 left-0 right-0 z-50 px-4 sm:px-6">
        <div className="max-w-[1160px] mx-auto flex items-center h-[66px] justify-between">
          <Logo />
          <div className="hidden sm:flex items-center gap-[10px]">
            <Link
              href="/marketplace"
              className="px-[14px] py-[7px] rounded-lg text-[13px] text-muted hover:text-foreground transition-colors"
            >
              Marketplace
            </Link>
            <button
              onClick={() => {
                setRole("org");
                router.push("/org");
              }}
              className="px-[14px] py-[7px] rounded-lg text-[13px] text-muted hover:text-foreground transition-colors"
            >
              For researchers
            </button>
            <WalletButton />
          </div>
          <Link
            href="/marketplace"
            className="sm:hidden px-3.5 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold"
          >
            Browse →
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex items-center h-[58px] sm:h-[62px] gap-3 sm:gap-7">
        <Logo />

        {/* Desktop: role switcher + links inline */}
        <div className="hidden md:flex gap-[2px] bg-surface-subtle rounded-lg p-[3px] flex-shrink-0">
          {(
            [
              ["patient", "Patient"],
              ["org", "Organization"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleRoleChange(value)}
              className={cn(
                "px-3 py-[5px] rounded-md text-xs transition-all",
                role === value
                  ? "bg-surface text-foreground font-semibold shadow-[0_1px_3px_rgba(28,25,23,0.08)]"
                  : "text-placeholder font-normal hover:text-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex gap-[2px] flex-1">
          {links.map(({ href, label, showBadge }) => {
            const active =
              href === "/org"
                ? pathname === "/org"
                : href === "/org/create"
                  ? pathname.startsWith("/org/create")
                  : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-[14px] py-[6px] rounded-[7px] text-[13px] transition-all flex items-center gap-1.5",
                  active
                    ? "bg-accent-light text-accent font-semibold"
                    : "text-muted hover:text-foreground",
                )}
              >
                {label}
                {showBadge && pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#f59e0b] text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex-1 md:flex-none" />

        {/* Wallet always visible */}
        <WalletButton />

        {/* Mobile menu trigger */}
        <button
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="md:hidden w-9 h-9 rounded-lg border-[1.5px] border-border flex items-center justify-center text-foreground hover:border-accent transition-colors"
        >
          <span className="block w-4 h-[2px] bg-current relative before:content-[''] before:absolute before:left-0 before:right-0 before:h-[2px] before:bg-current before:-top-1.5 after:content-[''] after:absolute after:left-0 after:right-0 after:h-[2px] after:bg-current after:top-1.5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3">
          <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px]">
            {(
              [
                ["patient", "Patient"],
                ["org", "Organization"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleRoleChange(value)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-md text-xs transition-all",
                  role === value
                    ? "bg-surface text-foreground font-semibold"
                    : "text-placeholder",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {links.map(({ href, label, showBadge }) => {
              const active =
                href === "/org"
                  ? pathname === "/org"
                  : href === "/org/create"
                    ? pathname.startsWith("/org/create")
                    : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-2.5 rounded-[7px] text-sm transition-all flex items-center justify-between",
                    active
                      ? "bg-accent-light text-accent font-semibold"
                      : "text-foreground-soft hover:bg-surface-subtle",
                  )}
                >
                  <span>{label}</span>
                  {showBadge && pendingCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#f59e0b] text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
