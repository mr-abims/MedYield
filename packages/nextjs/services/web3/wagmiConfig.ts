"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  rabbyWallet,
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId && typeof window !== "undefined") {
  console.warn(
    "[MedYield] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — " +
      "WalletConnect-based wallets (mobile, QR) will not work. " +
      "Get a free project id at https://cloud.reown.com.",
  );
}

const rpcUrl =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ||
  arbitrumSepolia.rpcUrls.default.http[0];

export const config = getDefaultConfig({
  appName: "MedYield",
  appDescription:
    "Privacy-preserving health data marketplace on Arbitrum. Earn from encrypted health data.",
  appUrl: "https://medyield.xyz",
  projectId: projectId || "medyield-dev",
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(rpcUrl),
  },
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        rainbowWallet,
        trustWallet,
        rabbyWallet,
        injectedWallet,
      ],
    },
  ],
});
