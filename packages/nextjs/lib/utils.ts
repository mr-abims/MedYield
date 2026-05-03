import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return "Closing soon";
}

export function formatCountdown(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return "Closing soon";
}

export function truncateAddress(addr: string, left = 4, right = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, 2 + left)}…${addr.slice(-right)}`;
}

export function truncateHash(hash: string, left = 6, right = 4): string {
  if (!hash) return "";
  if (hash.length <= left + right + 3) return hash;
  return `${hash.slice(0, left)}…${hash.slice(-right)}`;
}

const ARBISCAN_BASE = "https://sepolia.arbiscan.io";

export function arbiscanTx(hash: string): string {
  return `${ARBISCAN_BASE}/tx/${hash}`;
}

export function arbiscanAddress(addr: string): string {
  return `${ARBISCAN_BASE}/address/${addr}`;
}

export function randomHex(bytes: number): string {
  let s = "0x";
  for (let i = 0; i < bytes * 2; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
