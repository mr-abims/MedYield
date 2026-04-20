"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { truncateAddress } from "@/lib/utils";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
        authenticationStatus,
      }) => {
        const ready =
          mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-[7px] rounded-lg border-[1.5px] border-accent text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-colors"
                  >
                    Connect wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 px-[14px] py-[7px] rounded-lg border-[1.5px] border-[#ef4444] text-[#ef4444] text-xs font-semibold hover:bg-[#ef4444] hover:text-white transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    Wrong network
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="flex items-center gap-2 px-[14px] py-[7px] rounded-lg bg-surface-subtle hover:bg-border transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-xs font-semibold text-foreground-soft">
                    {truncateAddress(account.address)}
                  </span>
                  <span className="text-[11px] text-placeholder ml-1">
                    ↗ {chain.name === "Arbitrum Sepolia" ? "Arbitrum" : chain.name}
                  </span>
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
