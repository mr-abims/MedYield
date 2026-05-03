"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useChainId, useSignMessage, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store";
import type {
  Bounty,
  BountyField,
  ComputationOp,
  FieldType,
} from "@/lib/types";
import { cn, randomHex } from "@/lib/utils";

interface DraftField {
  name: string;
  type: FieldType;
  min: string;
  max: string;
  unit: string;
}

const TEMPLATES: {
  op: ComputationOp;
  label: string;
  description: string;
  outputLabel: string;
}[] = [
  {
    op: "average",
    label: "Aggregate Stats",
    description: "Compute mean / median across the cohort.",
    outputLabel: "Mean of <field> across cohort",
  },
  {
    op: "eligibility",
    label: "Eligibility Count",
    description: "Count records that meet a criterion (no values revealed).",
    outputLabel: "Count where <criterion>",
  },
  {
    op: "risk-score",
    label: "Risk Score",
    description: "Weighted score across fields, returned as cohort average.",
    outputLabel: "Mean risk index across cohort",
  },
  {
    op: "sum",
    label: "Cohort Sum",
    description: "Privacy-preserving sum across submissions.",
    outputLabel: "Sum of <field>",
  },
  {
    op: "count",
    label: "Headcount",
    description: "Total number of valid submissions.",
    outputLabel: "Count of valid submissions",
  },
];

function emptyField(): DraftField {
  return { name: "", type: "integer", min: "", max: "", unit: "" };
}

export default function CreateBountyPage() {
  return <Wizard />;
}

function Wizard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const wrongNetwork = isConnected && chainId !== arbitrumSepolia.id;
  const { switchChain, isPending: switching } = useSwitchChain();
  const { signMessageAsync } = useSignMessage();
  const addBounty = useAppStore((s) => s.addBounty);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 0: org identity + template
  const [orgName, setOrgName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateIndex, setTemplateIndex] = useState(0);
  const [outputLabel, setOutputLabel] = useState("");
  const [resultPolicy, setResultPolicy] = useState(
    "Decrypted only after the minimum cohort size is reached.",
  );

  // Step 1: schema
  const [fields, setFields] = useState<DraftField[]>([emptyField()]);

  // Step 2: economics
  const [pricePerRecord, setPricePerRecord] = useState("3.00");
  const [maxSubmissions, setMaxSubmissions] = useState("1000");
  const [minSubmissions, setMinSubmissions] = useState("200");
  const [days, setDays] = useState("14");

  if (!isConnected) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-foreground mb-3">
          Connect to create a bounty
        </h1>
        <p className="text-sm text-muted mb-6">
          Bounties are deployed from your wallet on Arbitrum Sepolia.
        </p>
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              className="px-7 py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Connect wallet →
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-medium text-foreground mb-3">
          Switch to Arbitrum Sepolia
        </h1>
        <p className="text-sm text-muted mb-6">
          MedYield bounties live on Arbitrum Sepolia.
        </p>
        <button
          onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
          disabled={switching}
          className="px-7 py-[13px] rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {switching ? "Switching…" : "Switch network →"}
        </button>
      </div>
    );
  }

  const template = TEMPLATES[templateIndex];

  const validateStep0 = () =>
    orgName.trim().length > 0 &&
    title.trim().length > 0 &&
    description.trim().length > 0;

  const validateStep1 = () => {
    if (fields.length === 0) return false;
    return fields.every((f) => {
      if (!f.name.trim()) return false;
      if (f.type === "boolean") return true;
      const min = parseFloat(f.min);
      const max = parseFloat(f.max);
      return !isNaN(min) && !isNaN(max) && max > min;
    });
  };

  const price = parseFloat(pricePerRecord);
  const maxSubs = parseInt(maxSubmissions, 10);
  const minSubs = parseInt(minSubmissions, 10);
  const dur = parseInt(days, 10);
  const totalEscrow = price * maxSubs;

  const validateStep2 =
    !isNaN(price) &&
    price > 0 &&
    !isNaN(maxSubs) &&
    maxSubs > 0 &&
    !isNaN(minSubs) &&
    minSubs > 0 &&
    minSubs <= maxSubs &&
    !isNaN(dur) &&
    dur > 0;

  const deploy = async () => {
    if (!address) return;
    setSubmitting(true);
    try {
      const message =
        `MedYield bounty deployment\n` +
        `Org: ${orgName}\n` +
        `Title: ${title}\n` +
        `Template: ${template.label}\n` +
        `Escrow: $${totalEscrow.toFixed(2)} USDC\n` +
        `Max submissions: ${maxSubs}\n` +
        `Deployed at: ${new Date().toISOString()}`;
      await signMessageAsync({ message });

      const bounty: Bounty = {
        id: `b-${Date.now()}`,
        org: orgName,
        verified: false,
        title,
        description,
        fields: fields.map<BountyField>((f) => ({
          name: f.name,
          type: f.type,
          min: f.type === "boolean" ? 0 : parseFloat(f.min),
          max: f.type === "boolean" ? 1 : parseFloat(f.max),
          unit: f.type === "boolean" ? "yes/no" : f.unit || "",
        })),
        templateLabel: template.label,
        computeDescription:
          resultPolicy ||
          "Aggregate computation runs on encrypted values; individual records are never decrypted.",
        computation: {
          op: template.op,
          outputLabel: outputLabel || template.outputLabel,
          resultPolicy,
        },
        contractAddress: randomHex(20),
        pricePerRecord: price,
        escrow: totalEscrow,
        escrowUsed: 0,
        minSubmissions: minSubs,
        maxSubmissions: maxSubs,
        submissions: 0,
        validatedSubmissions: 0,
        deadline: Date.now() + dur * 86400000,
        status: "OPEN",
      };

      addBounty(bounty);
      toast.success("Bounty deployed");
      router.push(`/marketplace/${bounty.id}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.split("\n")[0]
          : "Deployment cancelled";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <Link
        href="/org"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground mb-5"
      >
        ← Back to dashboard
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-1.5">
          Create a bounty
        </h1>
        <p className="text-sm text-muted">
          Four steps. We&apos;ll deploy the escrow contract on Arbitrum
          Sepolia.
        </p>
      </div>

      <Steps step={step} />

      <div className="rounded-[14px] border border-border bg-surface p-5 sm:p-7 shadow-card">
        {step === 0 && (
          <Step0
            orgName={orgName}
            setOrgName={setOrgName}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            templateIndex={templateIndex}
            setTemplateIndex={(i) => {
              setTemplateIndex(i);
              setOutputLabel(TEMPLATES[i].outputLabel);
            }}
            outputLabel={outputLabel || template.outputLabel}
            setOutputLabel={setOutputLabel}
            resultPolicy={resultPolicy}
            setResultPolicy={setResultPolicy}
          />
        )}
        {step === 1 && (
          <Step1
            fields={fields}
            update={(i, patch) =>
              setFields((curr) =>
                curr.map((f, j) => (i === j ? { ...f, ...patch } : f)),
              )
            }
            add={() => setFields((c) => [...c, emptyField()])}
            remove={(i) =>
              setFields((c) =>
                c.length === 1 ? c : c.filter((_, j) => j !== i),
              )
            }
          />
        )}
        {step === 2 && (
          <Step2
            pricePerRecord={pricePerRecord}
            setPricePerRecord={setPricePerRecord}
            maxSubmissions={maxSubmissions}
            setMaxSubmissions={setMaxSubmissions}
            minSubmissions={minSubmissions}
            setMinSubmissions={setMinSubmissions}
            days={days}
            setDays={setDays}
            totalEscrow={totalEscrow}
          />
        )}
        {step === 3 && (
          <Step3Review
            orgName={orgName}
            title={title}
            description={description}
            template={template}
            outputLabel={outputLabel || template.outputLabel}
            resultPolicy={resultPolicy}
            fields={fields}
            price={price}
            maxSubs={maxSubs}
            minSubs={minSubs}
            days={dur}
            totalEscrow={totalEscrow}
          />
        )}

        <div className="flex gap-2.5 mt-7">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
              className="w-24 py-3 rounded-[10px] border-[1.5px] border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors"
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 0 && !validateStep0()) {
                  toast.error("Fill in org name, title, and description.");
                  return;
                }
                if (step === 1 && !validateStep1()) {
                  toast.error("Each field needs a name and a valid range.");
                  return;
                }
                if (step === 2 && !validateStep2) {
                  toast.error("Check pricing, cohort size, and duration.");
                  return;
                }
                setStep((s) => s + 1);
              }}
              className="flex-1 py-3 rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={deploy}
              disabled={submitting}
              className="flex-1 py-3 rounded-[10px] bg-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting
                ? "Deploying…"
                : `Deploy & fund $${totalEscrow.toLocaleString()} escrow ↗`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Template", "Schema", "Economics", "Review"];
  return (
    <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-shrink-0">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold",
              i === step
                ? "bg-accent text-white"
                : i < step
                  ? "bg-accent-light text-accent"
                  : "bg-surface-subtle text-placeholder",
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-[12px] font-medium whitespace-nowrap",
              i === step ? "text-foreground" : "text-placeholder",
            )}
          >
            {label}
          </span>
          {i < labels.length - 1 && (
            <span className="w-6 h-px bg-border mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-foreground-soft mb-1.5 tracking-wide">
        {label}
      </div>
      {children}
      {hint && <div className="text-[11px] text-placeholder mt-1">{hint}</div>}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-lg text-sm text-foreground bg-surface outline-none transition-colors border-[1.5px] border-border focus:border-accent";

function Step0(props: {
  orgName: string;
  setOrgName: (s: string) => void;
  title: string;
  setTitle: (s: string) => void;
  description: string;
  setDescription: (s: string) => void;
  templateIndex: number;
  setTemplateIndex: (i: number) => void;
  outputLabel: string;
  setOutputLabel: (s: string) => void;
  resultPolicy: string;
  setResultPolicy: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Organization name">
          <input
            value={props.orgName}
            onChange={(e) => props.setOrgName(e.target.value)}
            placeholder="e.g. Novartis Research"
            className={inputCls}
          />
        </Field>
        <Field label="Bounty title">
          <input
            value={props.title}
            onChange={(e) => props.setTitle(e.target.value)}
            placeholder="e.g. Cardiovascular Risk Study"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Short description">
        <textarea
          value={props.description}
          onChange={(e) => props.setDescription(e.target.value)}
          placeholder="One-sentence summary patients will see on their bounty card."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

      <Field label="Computation template">
        <div className="grid sm:grid-cols-2 gap-2">
          {TEMPLATES.map((t, i) => (
            <button
              type="button"
              key={t.op}
              onClick={() => props.setTemplateIndex(i)}
              className={cn(
                "text-left px-4 py-3 rounded-[12px] border-[1.5px] transition-colors",
                props.templateIndex === i
                  ? "border-accent bg-accent-light"
                  : "border-border bg-surface hover:border-placeholder",
              )}
            >
              <div className="text-[13px] font-semibold text-foreground mb-0.5">
                {t.label}
              </div>
              <div className="text-[12px] text-muted leading-[1.4]">
                {t.description}
              </div>
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Computation output description"
        hint="What patients will see as the result label."
      >
        <input
          value={props.outputLabel}
          onChange={(e) => props.setOutputLabel(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field
        label="Result decryption policy"
        hint="Who can decrypt the cohort result, and when."
      >
        <textarea
          value={props.resultPolicy}
          onChange={(e) => props.setResultPolicy(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>
    </div>
  );
}

function Step1({
  fields,
  update,
  add,
  remove,
}: {
  fields: DraftField[];
  update: (i: number, patch: Partial<DraftField>) => void;
  add: () => void;
  remove: (i: number) => void;
}) {
  return (
    <div>
      <p className="text-[13px] text-muted mb-4 leading-[1.55]">
        Define the fields patients will submit. Range checks run on the
        ciphertext on-chain — out-of-range values are rejected without
        revealing the value.
      </p>

      <div className="flex flex-col gap-3 mb-4">
        {fields.map((f, i) => (
          <div
            key={i}
            className="rounded-[12px] border border-border bg-bg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[12px] font-semibold text-foreground">
                Field {i + 1}
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-[11px] text-muted hover:text-[#ef4444]"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              <input
                value={f.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Field name (e.g. Systolic BP)"
                className={inputCls}
              />
              <select
                value={f.type}
                onChange={(e) =>
                  update(i, { type: e.target.value as FieldType })
                }
                className={inputCls}
              >
                <option value="integer">Integer</option>
                <option value="decimal">Decimal</option>
                <option value="boolean">Yes / No</option>
              </select>
            </div>
            {f.type !== "boolean" && (
              <div className="grid grid-cols-3 gap-3">
                <input
                  value={f.min}
                  onChange={(e) => update(i, { min: e.target.value })}
                  placeholder="Min"
                  type="number"
                  className={`${inputCls} no-spinners`}
                />
                <input
                  value={f.max}
                  onChange={(e) => update(i, { max: e.target.value })}
                  placeholder="Max"
                  type="number"
                  className={`${inputCls} no-spinners`}
                />
                <input
                  value={f.unit}
                  onChange={(e) => update(i, { unit: e.target.value })}
                  placeholder="Unit (e.g. mmHg)"
                  className={inputCls}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="w-full py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border text-[13px] text-muted hover:border-accent hover:text-accent transition-colors"
      >
        + Add another field
      </button>
    </div>
  );
}

function Step2(props: {
  pricePerRecord: string;
  setPricePerRecord: (s: string) => void;
  maxSubmissions: string;
  setMaxSubmissions: (s: string) => void;
  minSubmissions: string;
  setMinSubmissions: (s: string) => void;
  days: string;
  setDays: (s: string) => void;
  totalEscrow: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Price per record (USDC)"
          hint="What each patient earns when their record passes the range check."
        >
          <input
            value={props.pricePerRecord}
            onChange={(e) => props.setPricePerRecord(e.target.value)}
            type="number"
            step="0.01"
            min="0.01"
            className={`${inputCls} no-spinners`}
          />
        </Field>
        <Field label="Submission deadline (days from now)">
          <input
            value={props.days}
            onChange={(e) => props.setDays(e.target.value)}
            type="number"
            step="1"
            min="1"
            className={`${inputCls} no-spinners`}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Min cohort size"
          hint="Computation can only run after this many validated records."
        >
          <input
            value={props.minSubmissions}
            onChange={(e) => props.setMinSubmissions(e.target.value)}
            type="number"
            step="1"
            min="1"
            className={`${inputCls} no-spinners`}
          />
        </Field>
        <Field
          label="Max cohort size"
          hint="Caps the escrow. Patients see slots-left in real time."
        >
          <input
            value={props.maxSubmissions}
            onChange={(e) => props.setMaxSubmissions(e.target.value)}
            type="number"
            step="1"
            min="1"
            className={`${inputCls} no-spinners`}
          />
        </Field>
      </div>

      <div className="rounded-[12px] bg-accent-light p-4 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-accent tracking-wider uppercase mb-0.5">
            Escrow to fund
          </div>
          <div className="text-[12px] text-foreground-soft">
            price × max submissions, locked on-chain.
          </div>
        </div>
        <div className="font-display text-2xl font-semibold text-accent">
          ${props.totalEscrow.toLocaleString()} USDC
        </div>
      </div>
    </div>
  );
}

function Step3Review(props: {
  orgName: string;
  title: string;
  description: string;
  template: (typeof TEMPLATES)[number];
  outputLabel: string;
  resultPolicy: string;
  fields: DraftField[];
  price: number;
  maxSubs: number;
  minSubs: number;
  days: number;
  totalEscrow: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Section title="Identity">
        <KeyVal label="Org">{props.orgName}</KeyVal>
        <KeyVal label="Title">{props.title}</KeyVal>
        <KeyVal label="Description">{props.description}</KeyVal>
      </Section>
      <Section title="Computation">
        <KeyVal label="Template">{props.template.label}</KeyVal>
        <KeyVal label="Output">{props.outputLabel}</KeyVal>
        <KeyVal label="Decryption policy">{props.resultPolicy}</KeyVal>
      </Section>
      <Section title="Schema">
        <div className="flex flex-col gap-2">
          {props.fields.map((f, i) => (
            <div
              key={i}
              className="text-[13px] text-foreground-soft flex justify-between gap-3"
            >
              <span className="font-medium">{f.name || `Field ${i + 1}`}</span>
              <span className="text-muted">
                {f.type === "boolean"
                  ? "Yes / No"
                  : `${f.min}–${f.max} ${f.unit || ""}`}
              </span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Economics">
        <KeyVal label="Per record">${props.price.toFixed(2)} USDC</KeyVal>
        <KeyVal label="Cohort">
          {props.minSubs.toLocaleString()} min ·{" "}
          {props.maxSubs.toLocaleString()} max
        </KeyVal>
        <KeyVal label="Deadline">{props.days} days from deploy</KeyVal>
        <KeyVal label="Total escrow">
          ${props.totalEscrow.toLocaleString()} USDC
        </KeyVal>
      </Section>
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
    <div className="rounded-[10px] border border-border bg-bg p-4">
      <div className="text-[10px] font-bold tracking-[0.08em] text-placeholder uppercase mb-2">
        {title}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
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
    <div className="flex justify-between gap-3 text-[13px]">
      <span className="text-muted flex-shrink-0">{label}</span>
      <span className="text-foreground text-right">{children}</span>
    </div>
  );
}
