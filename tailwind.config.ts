import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#d4a017",
          500: "#b8860b",
          600: "#9a6d0a",
          700: "#7a5508",
        },
        surface: {
          700: "#1a1a2e",
          800: "#141428",
          900: "#0f0f1e",
          950: "#0a0a14",
        },
        'text': {
          primary: "#e0d6c8",
          secondary: "#a89880",
          muted: "#6b5e4a",
        },
        border: {
          subtle: "#2a2a3a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { textShadow: "0 0 4px #b8860b, 0 0 8px #b8860b" },
          "100%": { textShadow: "0 0 8px #b8860b, 0 0 16px #b8860b, 0 0 24px #b8860b" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
