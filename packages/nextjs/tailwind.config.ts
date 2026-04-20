import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#faf8f5",
        surface: "#ffffff",
        "surface-subtle": "#f0ede8",
        border: "#ede9e4",
        foreground: "#1c1917",
        "foreground-soft": "#44403c",
        muted: "#78716c",
        placeholder: "#a8a29e",
        faint: "#d6d3d1",
        "dark-surface": "#1c1917",
        accent: {
          DEFAULT: "#059669",
          light: "#d1fae5",
          violet: "#6c4ff5",
          "violet-light": "#ede9fe",
        },
        status: {
          "open-bg": "#d1fae5",
          "open-fg": "#065f46",
          "filling-bg": "#fef3c7",
          "filling-fg": "#92400e",
          "computing-bg": "#dbeafe",
          "computing-fg": "#1e40af",
          "completed-bg": "#f3f4f6",
          "completed-fg": "#374151",
          "error-bg": "#fee2e2",
          "error-fg": "#991b1b",
        },
        cofhe: {
          bg: "#0e1117",
          green: "#4fffb0",
          cyan: "#00d4ff",
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 4px rgba(28,25,23,0.05)",
        "card-hover": "0 8px 32px rgba(28,25,23,0.10)",
        drawer: "-8px 0 40px rgba(28,25,23,0.12)",
        floating: "0 8px 40px rgba(28,25,23,0.15)",
      },
      borderRadius: {
        pill: "20px",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        slideIn: {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.06)", opacity: "0.85" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.28s ease",
        "slide-in": "slideIn 0.25s ease",
        "pulse-soft": "pulseSoft 1.2s ease-in-out infinite",
        "spin-slow": "spin 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
