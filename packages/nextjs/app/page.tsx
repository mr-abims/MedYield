import Link from "next/link";
import { HeroEncryptViz } from "@/components/landing/HeroEncryptViz";

const STATS = [
  { value: "14", label: "Active bounties", sub: "Open for submissions" },
  { value: "$47B", label: "Health data market", sub: "Patients earn $0 today" },
  { value: "100%", label: "Client-side encryption", sub: "FHE on every field" },
  { value: "$0", label: "Plaintext exposure", sub: "Mathematical guarantee" },
];

const PATIENT_STEPS: [string, string, string][] = [
  [
    "1",
    "Browse open bounties",
    "See what researchers are paying for — field list, payout, deadline, and exactly what computation will run on your data.",
  ],
  [
    "2",
    "Enter & encrypt your data",
    "Fill in a simple form. Your browser encrypts every field using FHE before anything leaves your device.",
  ],
  [
    "3",
    "Submit & get paid instantly",
    "One wallet signature submits the ciphertext. The contract validates your range — no one sees the value — and pays you on the spot.",
  ],
];

const ORG_STEPS: [string, string, string][] = [
  [
    "1",
    "Create a bounty & fund escrow",
    "Pick a computation template, define the data schema and valid ranges, set your price per record, and deposit stablecoin into on-chain escrow.",
  ],
  [
    "2",
    "Collect encrypted submissions",
    "Patients submit ciphertexts that are range-validated on-chain. Watch your cohort fill in real time — no PHI ever touches your systems.",
  ],
  [
    "3",
    "Run the computation, get results",
    "Trigger the aggregate computation when ready. Results are the only thing ever decrypted. Never individual records.",
  ],
];

const GUARANTEES = [
  {
    icon: "🔒",
    title: "Client-side only",
    body: "Encryption happens in your browser. Ciphertexts are what gets transmitted — nothing else.",
  },
  {
    icon: "⛓",
    title: "On-chain validation",
    body: "Range checks run on the encrypted values. The chain learns only pass/fail — never the number.",
  },
  {
    icon: "∑",
    title: "Aggregate results only",
    body: "Computation outputs are cohort-level statistics. Individual records are mathematically inaccessible.",
  },
];

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-full flex-shrink-0 bg-accent text-white flex items-center justify-center font-display text-base font-medium">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground mb-1">{title}</div>
        <div className="text-[13px] text-muted leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-[66px]">
        <div className="absolute inset-0 opacity-[0.03] dot-grid" />
        <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-bg to-transparent" />
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 sm:pt-[72px] pb-16 sm:pb-24 flex flex-col md:flex-row items-center gap-10 md:gap-[60px] relative z-[1]">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-[7px] px-3 py-[5px] rounded-pill bg-accent-light mb-5 sm:mb-[22px]">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[11px] font-semibold text-accent tracking-wide">
                Powered by Fully Homomorphic Encryption
              </span>
            </div>
            <h1 className="font-display text-[36px] sm:text-[44px] md:text-[52px] font-medium text-foreground leading-[1.13] mb-5 tracking-tight">
              Earn from your
              <br />
              health data.
              <br />
              <span className="text-accent">Keep it encrypted.</span>
              <br />
              Always.
            </h1>
            <p className="text-[15px] sm:text-base text-muted leading-[1.75] mb-7 sm:mb-9 max-w-[440px]">
              Researchers post paid bounties. You submit encrypted health data
              directly from your browser. Your raw values never touch a server —
              math runs on the ciphertext.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/marketplace"
                className="px-6 sm:px-7 py-[12px] sm:py-[13px] rounded-[10px] bg-accent text-white text-[14px] sm:text-[15px] font-semibold hover:opacity-90 transition-opacity"
              >
                Browse bounties →
              </Link>
              <Link
                href="/org"
                className="px-6 sm:px-7 py-[12px] sm:py-[13px] rounded-[10px] border-[1.5px] border-border bg-surface text-foreground-soft text-[14px] sm:text-[15px] font-medium hover:border-accent transition-colors"
              >
                Post a bounty
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <HeroEncryptViz />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 py-5 sm:py-6 text-center ${
                i < STATS.length - 1 ? "md:border-r border-border" : ""
              } ${i % 2 === 0 ? "border-r md:border-r" : ""} ${
                i < 2 ? "border-b md:border-b-0" : ""
              }`}
            >
              <div className="font-display text-3xl sm:text-4xl font-medium text-foreground leading-none">
                {s.value}
              </div>
              <div className="text-[12px] sm:text-[13px] font-semibold text-foreground-soft mt-1.5">
                {s.label}
              </div>
              <div className="text-[11px] text-placeholder mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-14">
          <div className="text-xs font-bold tracking-[0.1em] text-accent mb-2.5 uppercase">
            How it works
          </div>
          <h2 className="font-display text-[28px] sm:text-[38px] font-medium text-foreground m-0">
            Two sides. One encrypted vault.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Patient card */}
          <div className="bg-surface rounded-[20px] border border-border p-8 shadow-[0_2px_12px_rgba(28,25,23,0.04)]">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-10 h-10 rounded-[10px] bg-accent-light flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="4" stroke="#059669" strokeWidth="1.5" />
                  <path
                    d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6"
                    stroke="#059669"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-bold text-foreground">
                  For patients
                </div>
                <div className="text-[11px] text-placeholder">
                  Earn from your data
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {PATIENT_STEPS.map(([n, t, b]) => (
                <HowStep key={n} n={n} title={t} body={b} />
              ))}
            </div>
            <Link
              href="/marketplace"
              className="mt-7 block text-center w-full py-[11px] rounded-[9px] bg-accent text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Browse bounties →
            </Link>
          </div>

          {/* Org card */}
          <div className="bg-surface rounded-[20px] border border-border p-8 shadow-[0_2px_12px_rgba(28,25,23,0.04)]">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-10 h-10 rounded-[10px] bg-surface-subtle flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="8"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="#44403c"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 8V6a3 3 0 016 0v2"
                    stroke="#44403c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="13" r="1.5" fill="#44403c" />
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-bold text-foreground">
                  For organizations
                </div>
                <div className="text-[11px] text-placeholder">
                  Pharma, CROs, researchers
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {ORG_STEPS.map(([n, t, b]) => (
                <HowStep key={n} n={n} title={t} body={b} />
              ))}
            </div>
            <Link
              href="/org"
              className="mt-7 block text-center w-full py-[11px] rounded-[9px] bg-foreground text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              Post a bounty →
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy guarantee — dark */}
      <section className="bg-dark-surface py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="text-xs font-bold tracking-[0.1em] text-accent mb-4 uppercase">
            The privacy guarantee
          </div>
          <h2 className="font-display text-[28px] sm:text-4xl font-medium text-[#faf8f5] leading-tight mb-5">
            Your data is never decrypted.
            <br />
            Not once. Not ever.
          </h2>
          <p className="text-base text-[#a8a29e] leading-[1.75] mb-10">
            Fully Homomorphic Encryption lets the network run range checks and
            aggregate computations directly on ciphertexts. Researchers get their
            cohort answer. Your blood pressure value stays a secret —
            mathematically, not by policy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GUARANTEES.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-[14px] bg-white/[0.05] border border-white/[0.08] text-left"
              >
                <div className="text-2xl mb-2.5">{item.icon}</div>
                <div className="text-[13px] font-semibold text-[#faf8f5] mb-1.5">
                  {item.title}
                </div>
                <div className="text-xs text-[#78716c] leading-relaxed">
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h2 className="font-display text-[30px] sm:text-[40px] font-medium text-foreground mb-4">
          Ready to get started?
        </h2>
        <p className="text-base text-muted mb-9">
          Submit to a study in under 90 seconds, or post a bounty and have data
          flowing today.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/marketplace"
            className="px-8 py-3.5 rounded-[10px] bg-accent text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
          >
            Browse open bounties
          </Link>
          <Link
            href="/org"
            className="px-8 py-3.5 rounded-[10px] border-[1.5px] border-border bg-surface text-foreground-soft text-[15px] hover:border-accent transition-colors"
          >
            I&apos;m a researcher
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-7 px-6">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center flex-wrap gap-3">
          <div className="font-display text-base font-medium text-foreground">
            MedYield
          </div>
          <div className="text-xs text-placeholder">
            Built on Arbitrum Sepolia · Powered by CoFHE
          </div>
        </div>
      </footer>
    </div>
  );
}
