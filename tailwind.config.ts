import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          300: "#f0c040",
          400: "#d4a017",
          500: "#b8860b",
          600: "#9a6d0a",
          700: "#7a5508",
        },
        surface: {
          700: "#181838",
          800: "#101028",
          900: "#0a0a18",
          950: "#06060f",
        },
        'text': {
          primary: "#e8e0d4",
          secondary: "#b0a590",
          muted: "#6e6252",
        },
        border: {
          subtle: "#2a2a44",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Noto Serif SC", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-breath": "glowBreath 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "fade-in": "fadeIn 1s ease-out forwards",
        "star-drift": "starDrift 60s linear infinite",
        "particle-float": "particleFloat 12s ease-in-out infinite",
        "status-pulse": "statusPulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowBreath: {
          "0%, 100%": { textShadow: "0 0 8px rgba(212,160,23,0.4), 0 0 16px rgba(212,160,23,0.2)" },
          "50%": { textShadow: "0 0 16px rgba(212,160,23,0.7), 0 0 32px rgba(212,160,23,0.4), 0 0 48px rgba(212,160,23,0.2)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        starDrift: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "200px 200px" },
        },
        particleFloat: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.5" },
          "25%": { transform: "translate(30px, -20px) scale(1.3)", opacity: "0.8" },
          "50%": { transform: "translate(-20px, -40px) scale(0.8)", opacity: "0.3" },
          "75%": { transform: "translate(-40px, 10px) scale(1.2)", opacity: "0.7" },
        },
        statusPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
