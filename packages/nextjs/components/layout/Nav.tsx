"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Logo } from "./Logo";
import { WalletButton } from "./WalletButton";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; showBadge?: boolean };

const PATIENT_LINKS: NavLink[] = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/earnings", label: "My Earnings", showBadge: true },
];

const ORG_LINKS: NavLink[] = [{ href: "/org", label: "My Bounties" }];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const pendingCount = useAppStore((s) =>
    s.submissions.filter((x) => x.status === "pending").length,
  );

  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <nav className="absolute top-0 left-0 right-0 z-50 px-6">
        <div className="max-w-[1160px] mx-auto flex items-center h-[66px] justify-between">
          <Logo />
          <div className="flex items-center gap-[10px]">
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
        </div>
      </nav>
    );
  }

  const links = role === "org" ? ORG_LINKS : PATIENT_LINKS;

  const handleRoleChange = (next: typeof role) => {
    setRole(next);
    router.push(next === "org" ? "/org" : "/marketplace");
  };

  return (
    <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1160px] mx-auto px-6 flex items-center h-[62px] gap-7">
        <Logo />

        {/* Role switcher */}
        <div className="flex gap-[2px] bg-surface-subtle rounded-lg p-[3px] flex-shrink-0">
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

        {/* Links */}
        <div className="flex gap-[2px] flex-1">
          {links.map(({ href, label, showBadge }) => {
            const active =
              href === "/org"
                ? pathname.startsWith("/org")
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

        <WalletButton />
      </div>
    </nav>
  );
}
