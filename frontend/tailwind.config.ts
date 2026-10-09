import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070A12",
        canvas: "#0B0F19",
        surface: {
          50:  "#192236",
          100: "#131A2B",
          200: "#0F1523",
          300: "#0C101C",
          DEFAULT: "#0F1523",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.05)",
          focus: "rgba(99, 102, 241, 0.5)",
        },
        brand: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1", // Primary Electric Indigo
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        model: {
          baseline: "#64748B", // Popularity Baseline (Slate)
          cf:       "#0284C7", // Collaborative Filtering (Sky/Blue)
          cbf:      "#8B5CF6", // Content-Based Filtering (Purple/Violet)
          hybrid:   "#10B981", // Hybrid Ensemble (Emerald)
          mf:       "#06B6D4", // Matrix Factorization (Cyan)
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 15px -3px rgba(99, 102, 241, 0.15)",
        "glow-md": "0 0 25px -5px rgba(99, 102, 241, 0.25)",
        "cinematic": "0 20px 40px -15px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
