import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { Nav } from "@/components/layout/Nav";
import { StoreHydrator } from "@/components/StoreHydrator";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MedYield — Earn from your health data, keep it encrypted.",
  description:
    "Privacy-preserving health data marketplace on Arbitrum. Patients submit FHE-encrypted data to paid bounties; raw values never leave the browser.",
};

// Wallet state lives in cookies/localStorage; rendering is inherently dynamic.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-foreground font-sans antialiased">
        <Providers>
          <StoreHydrator />
          <Nav />
          <main className="animate-fade-in">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#ffffff",
                color: "#1c1917",
                border: "1px solid #ede9e4",
                borderRadius: "10px",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
              },
              success: { iconTheme: { primary: "#059669", secondary: "#ffffff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
