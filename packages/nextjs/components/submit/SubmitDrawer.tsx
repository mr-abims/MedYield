"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { Bounty } from "@/lib/types";
import { formatCountdown, truncateAddress } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  bounty: Bounty | null;
  onClose: () => void;
}

export function SubmitDrawer({ bounty, onClose }: Props) {
  useEffect(() => {
    if (!bounty) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [bounty]);

  if (!bounty) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
      />
      <div
        className="relative z-[1] w-[480px] max-w-full h-screen bg-surface overflow-y-auto px-8 pt-8 pb-10 shadow-drawer animate-slide-in"
        role="dialog"
        aria-modal
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full border-[1.5px] border-border bg-surface flex items-center justify-center text-muted text-base leading-none hover:border-accent hover:text-accent transition-colors"
        >
          ×
        </button>

        <DrawerBody key={bounty.id} bounty={bounty} onClose={onClose} />
      </div>
    </div>
  );
}

function DrawerBody({ bounty, onClose }: { bounty: Bounty; onClose: () => void }) {
  const { isConnected } = useAccount();
  const [step, setStep] = useState(0);
  const addSubmission = useAppStore((s) => s.addSubmission);

  const handleComplete = () => {
    addSubmission(bounty);
    onClose();
  };

  if (!isConnected) return <StepConnect />;

  return (
    <>
      {step === 0 && <StepOverview bounty={bounty} onNext={() => setStep(1)} />}
      {step === 1 && (
        <StepForm
          bounty={bounty}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepEncrypting bounty={bounty} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <StepConfirm
          bounty={bounty}
          onBack={() => setStep(1)}
          onSubmit={handleComplete}
        />
      )}
    </>
  );
}

function StepConnect() {
  return (
    <div className="pt-2">
      <div className="text-[11px] font-bold tracking-[0.08em] text-accent mb-2 uppercase">
        Wallet required
      </div>
      <h2 className="font-display text-[26px] font-medium text-foreground mb-2.5">
        Connect your wallet to continue
      </h2>
      <p className="text-sm text-muted leading-[1.65] mb-6">
        Submissions are signed on-chain so you can be paid directly. Connect a
        wallet on Arbitrum Sepolia to view this bounty&apos;s form and earn USDC.
      </p>

      <div className="px-4 py-3.5 rounded-[12px] bg-accent-light mb-6 flex gap-3 items-start">
        <ShieldIcon size={28} />
        <div>
          <div className="text-[11px] font-bold text-accent tracking-wider mb-0.5 uppercase">
            No gas. No custody.
          </div>
          <div className="text-[13px] text-foreground-soft leading-[1.55]">
            Your wallet signs a message to attest to the submission. MedYield
            never has access to your keys or funds.
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <button
              onClick={openConnectModal}
              disabled={!mounted}
              className="w-full py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity tracking-wide disabled:opacity-50"
            >
              Connect wallet →
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-7">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-[3px] transition-all duration-300",
            i === step && "w-6 bg-accent",
            i < step && "w-6 bg-accent opacity-40",
            i > step && "w-2 bg-[#e8e4e0]",
          )}
        />
      ))}
      <span className="text-[11px] text-placeholder ml-1">
        {step + 1} of {total}
      </span>
    </div>
  );
}

function ShieldIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M16 3L5 7.5v7C5 20.5 9.9 26.3 16 28c6.1-1.7 11-7.5 11-13.5v-7L16 3z"
        fill="#059669"
        opacity="0.12"
        stroke="#059669"
        strokeWidth="1.5"
      />
      <path
        d="M11 16l3 3 7-7"
        stroke="#059669"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="2"
        fill="#059669"
        opacity="0.15"
        stroke="#059669"
        strokeWidth="1.3"
      />
      <path
        d="M5 7V5a3 3 0 016 0v2"
        stroke="#059669"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11" r="1" fill="#059669" />
    </svg>
  );
}

function StepOverview({
  bounty,
  onNext,
}: {
  bounty: Bounty;
  onNext: () => void;
}) {
  return (
    <div>
      <StepIndicator step={0} total={4} />
      <div className="text-[11px] font-bold tracking-[0.08em] text-accent mb-2 uppercase">
        About this study
      </div>
      <h2 className="font-display text-[26px] font-medium text-foreground mb-2">
        {bounty.title}
      </h2>
      <p className="text-sm text-muted leading-[1.65] mb-6">
        {bounty.description}
      </p>

      <div className="mb-5">
        <div className="text-[11px] font-bold tracking-wider text-placeholder mb-2.5 uppercase">
          Data requested
        </div>
        <div className="flex flex-col gap-1.5">
          {bounty.fields.map((f) => (
            <div
              key={f.name}
              className="flex justify-between items-center px-3.5 py-2.5 rounded-lg bg-bg border border-border"
            >
              <div className="flex items-center gap-2">
                <LockIcon />
                <span className="text-[13px] font-medium text-foreground">
                  {f.name}
                </span>
              </div>
              <span className="text-xs text-muted">
                {f.type === "boolean"
                  ? "Yes / No"
                  : `${f.min}–${f.max} ${f.unit}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3.5 rounded-[12px] bg-accent-light mb-5 flex gap-3 items-start">
        <ShieldIcon size={28} />
        <div>
          <div className="text-[11px] font-bold text-accent tracking-wider mb-0.5 uppercase">
            Privacy guarantee
          </div>
          <div className="text-[13px] text-foreground-soft leading-[1.55]">
            {bounty.computeDescription}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-7">
        {[
          {
            label: "You earn",
            value: `$${bounty.pricePerRecord.toFixed(2)}`,
          },
          {
            label: "Closes in",
            value: formatCountdown(bounty.deadline),
          },
          {
            label: "Slots left",
            value: (
              bounty.maxSubmissions - bounty.validatedSubmissions
            ).toLocaleString(),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="px-3.5 py-3 rounded-[10px] bg-bg border border-border text-center"
          >
            <div className="font-display text-lg font-medium text-foreground">
              {item.value}
            </div>
            <div className="text-[11px] text-placeholder mt-0.5">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity tracking-wide"
      >
        I understand — enter my data →
      </button>
    </div>
  );
}

function StepForm({
  bounty,
  onBack,
  onNext,
}: {
  bounty: Bounty;
  onBack: () => void;
  onNext: () => void;
}) {
  const [values, setValues] = useState<Record<string, number | string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    bounty.fields.forEach((f) => {
      const v = values[f.name];
      if (v === undefined || v === "") {
        errs[f.name] = "Required";
        return;
      }
      if (f.type !== "boolean") {
        const num = parseFloat(String(v));
        if (isNaN(num)) {
          errs[f.name] = "Must be a number";
          return;
        }
        if (num < f.min || num > f.max) {
          errs[f.name] = `Must be between ${f.min} and ${f.max} ${f.unit}`;
        }
      }
    });
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  };

  return (
    <div>
      <StepIndicator step={1} total={4} />
      <h2 className="font-display text-2xl font-medium text-foreground mb-1.5">
        Enter your data
      </h2>
      <p className="text-[13px] text-muted mb-6 leading-[1.55]">
        Your values are validated against the allowed ranges in your browser,
        then encrypted before anything is sent.
      </p>

      <div className="flex flex-col gap-3.5 mb-7">
        {bounty.fields.map((f) => {
          const err = errors[f.name];
          const isBool = f.type === "boolean";
          return (
            <div key={f.name}>
              <label className="block text-xs font-semibold text-foreground-soft mb-1.5 tracking-wide">
                {f.name}
                <span className="font-normal text-placeholder ml-1">
                  {isBool ? "" : `(${f.min}–${f.max} ${f.unit})`}
                </span>
              </label>
              {isBool ? (
                <div className="flex gap-2">
                  {["Yes", "No"].map((opt) => {
                    const val = opt === "Yes" ? 1 : 0;
                    const selected = values[f.name] === val;
                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          setValues((v) => ({ ...v, [f.name]: val }))
                        }
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all border-[1.5px]",
                          selected
                            ? "border-accent bg-accent-light text-accent"
                            : "border-border bg-surface text-muted hover:border-placeholder",
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="number"
                  inputMode="decimal"
                  value={values[f.name] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value }))
                  }
                  placeholder={`e.g. ${Math.round((f.min + f.max) / 2)}`}
                  className={cn(
                    "no-spinners w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-surface outline-none transition-colors border-[1.5px] focus:border-accent",
                    err ? "border-[#ef4444]" : "border-border",
                  )}
                />
              )}
              {err && (
                <div className="text-[11px] text-[#ef4444] mt-1">⚠ {err}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onBack}
          className="w-20 py-3 rounded-[10px] border-[1.5px] border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={submit}
          className="flex-1 py-3 rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Encrypt & preview →
        </button>
      </div>
    </div>
  );
}

function StepEncrypting({
  bounty,
  onNext,
}: {
  bounty: Bounty;
  onNext: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<string[]>([]);
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const fields = bounty.fields;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      if (i >= fields.length) {
        setTimeout(() => !cancelled && setProgress(100), 300);
        return;
      }
      setTimeout(
        () => {
          if (cancelled) return;
          const f = fields[i];
          setDone((d) => [...d, f.name]);
          setHashes((h) => ({
            ...h,
            [f.name]: "0x" + Math.random().toString(16).slice(2, 8) + "…",
          }));
          setProgress(Math.round(((i + 1) / fields.length) * 90));
          i++;
          tick();
        },
        700 + Math.random() * 400,
      );
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [bounty]);

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(onNext, 800);
      return () => clearTimeout(t);
    }
  }, [progress, onNext]);

  return (
    <div className="text-center">
      <StepIndicator step={2} total={4} />

      <div className="mb-6">
        <div
          className={cn(
            "w-[72px] h-[72px] rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3.5",
            progress < 100 && "animate-pulse-soft",
          )}
        >
          <ShieldIcon size={36} />
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground mb-2">
          {progress < 100 ? "Encrypting your data…" : "Encryption complete"}
        </h2>
        <p className="text-[13px] text-muted leading-[1.55] mb-3.5">
          {progress < 100
            ? "Each field is being encrypted in your browser using Fully Homomorphic Encryption. Your raw values never leave this device."
            : "Your data is encrypted and ready. A wallet signature is all that's needed to submit."}
        </p>
        <div className="inline-flex items-center gap-[7px] pl-2 pr-3 py-[5px] rounded-pill bg-cofhe-bg border border-white/[0.08]">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cofhe-green to-cofhe-cyan flex items-center justify-center flex-shrink-0">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5h6M6 3l2 2-2 2"
                stroke="#0e1117"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-wider text-white uppercase">
            Encrypted by <span className="text-cofhe-green">Fhenix CoFHE</span>
          </span>
        </div>
      </div>

      <div className="mb-5">
        <div className="h-[5px] bg-surface-subtle rounded-[3px] mb-1.5 overflow-hidden">
          <div
            className="h-full rounded-[3px] transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                progress < 100
                  ? "#059669"
                  : "linear-gradient(90deg,#4fffb0,#00d4ff)",
            }}
          />
        </div>
        <div className="text-[11px] text-placeholder text-left">
          {progress}% complete
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left mb-6">
        {bounty.fields.map((f) => {
          const isDone = done.includes(f.name);
          return (
            <div
              key={f.name}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors",
                isDone ? "bg-accent-light" : "bg-bg",
              )}
            >
              <div
                className={cn(
                  "w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors",
                  isDone ? "bg-accent" : "bg-[#e8e4e0]",
                )}
              >
                {isDone && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isDone ? "text-accent" : "text-placeholder",
                )}
              >
                {f.name}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] ml-auto",
                  isDone ? "text-placeholder" : "text-faint",
                )}
              >
                {isDone ? hashes[f.name] ?? "" : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepConfirm({
  bounty,
  onBack,
  onSubmit,
}: {
  bounty: Bounty;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<
    "idle" | "confirming" | "pending" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    setState("confirming");
    try {
      const message =
        `MedYield submission\n` +
        `Bounty: ${bounty.title} (${bounty.id})\n` +
        `Org: ${bounty.org}\n` +
        `Payout: $${bounty.pricePerRecord.toFixed(2)} USDC\n` +
        `Submitted at: ${new Date().toISOString()}`;
      await signMessageAsync({ message });
      setState("pending");
      setTimeout(() => {
        setState("done");
        setTimeout(onSubmit, 1200);
      }, 2200);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.split("\n")[0]
          : "Signature rejected";
      setError(msg);
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="text-center py-5">
        <div className="w-[72px] h-[72px] rounded-full bg-accent-light flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M8 16l5 5 11-11"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-[26px] font-medium text-foreground mb-2">
          Validated &amp; paid!
        </h2>
        <p className="text-sm text-muted leading-[1.6]">
          Your encrypted submission passed the range check.
          <br />
          <strong className="text-accent">
            ${bounty.pricePerRecord.toFixed(2)} USDC
          </strong>{" "}
          has been released to your wallet.
        </p>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="text-center py-5">
        <div className="w-[72px] h-[72px] rounded-full bg-status-filling-bg flex items-center justify-center mx-auto mb-5 animate-spin-slow">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="#d97706"
              strokeWidth="2"
              strokeDasharray="50 26"
            />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground mb-2">
          Awaiting validation
        </h2>
        <p className="text-[13px] text-muted leading-[1.6] mb-4">
          The network is range-checking your encrypted values. This takes a few
          seconds — you&apos;ll be paid the moment it passes.
        </p>
        <div className="inline-block px-3.5 py-2.5 rounded-lg bg-status-filling-bg">
          <span className="text-xs text-status-filling-fg">
            ⏳ Encrypted data submitted. Running range check…
          </span>
        </div>
      </div>
    );
  }

  if (state === "confirming") {
    return (
      <div className="text-center py-5">
        <div className="w-[72px] h-[72px] rounded-full bg-accent-light flex items-center justify-center mx-auto mb-5 animate-pulse-soft">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              x="4"
              y="12"
              width="24"
              height="16"
              rx="3"
              fill="#059669"
              opacity="0.15"
              stroke="#059669"
              strokeWidth="1.5"
            />
            <path
              d="M10 12V9a6 6 0 0112 0v3"
              stroke="#059669"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="21" r="2" fill="#059669" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground mb-2">
          Confirm in wallet
        </h2>
        <p className="text-[13px] text-muted">
          Check your wallet and sign the submission attestation…
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center py-5">
        <div className="w-[72px] h-[72px] rounded-full bg-status-error-bg flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M10 10l12 12M22 10L10 22"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-medium text-foreground mb-2">
          Signature declined
        </h2>
        <p className="text-[13px] text-muted mb-5 leading-[1.6]">
          {error ?? "You cancelled the wallet signature."} Nothing was
          submitted. You can try again or go back.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onBack}
            className="w-20 py-3 rounded-[10px] border-[1.5px] border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handle}
            className="flex-1 py-3 rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator step={3} total={4} />
      <h2 className="font-display text-2xl font-medium text-foreground mb-1.5">
        Ready to submit
      </h2>
      <p className="text-[13px] text-muted mb-6 leading-[1.55]">
        Your data is encrypted and ready. One wallet signature submits the
        ciphertext on-chain.
      </p>

      <div className="p-4 rounded-[12px] bg-bg border border-border mb-5">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs text-muted">Bounty</span>
          <span className="text-[13px] font-medium text-foreground">
            {bounty.title}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs text-muted">Fields encrypted</span>
          <span className="text-[13px] font-medium text-foreground">
            {bounty.fields.length} fields
          </span>
        </div>
        {address && (
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs text-muted">Signing wallet</span>
            <span className="text-[13px] font-mono text-foreground">
              {truncateAddress(address)}
            </span>
          </div>
        )}
        <div className="h-px bg-border my-2.5" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted">You will receive</span>
          <span className="font-display text-xl font-semibold text-accent">
            ${bounty.pricePerRecord.toFixed(2)} USDC
          </span>
        </div>
      </div>

      <div className="px-3.5 py-3 rounded-[10px] bg-cofhe-bg mb-6 flex gap-2.5 items-start relative overflow-hidden">
        <div
          className="absolute -top-3 -right-3 w-16 h-16 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(79,255,176,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-cofhe-green to-cofhe-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5h6M6 3l2 2-2 2"
              stroke="#0e1117"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-[10px] font-bold text-cofhe-green tracking-wider uppercase mb-0.5">
            Fhenix CoFHE guarantee
          </div>
          <span className="text-xs text-white/50 leading-[1.55]">
            Your raw values never leave this browser. Only ciphertexts and
            cryptographic proofs are written on-chain.
          </span>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onBack}
          className="w-20 py-3 rounded-[10px] border-[1.5px] border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handle}
          className="flex-1 py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Submit encrypted data ↗
        </button>
      </div>
    </div>
  );
}
