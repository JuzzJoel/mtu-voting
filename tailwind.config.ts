import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Green + Purple
        primary: {
          green: "#16C47F",
          "green-deep": "#0E9F6E",
          purple: "#7C3AED",
          "purple-deep": "#5B21B6",
        },
        // Accent Colors
        accent: {
          lime: "#A3E635",
          violet: "#A855F7",
          mint: "#34D399",
          gold: "#FACC15",
          red: "#F43F5E",
        },
        // Neutral Colors
        neutral: {
          "bg-dark": "#F3F0F8",
          "surface-dark": "#FFFFFF",
          "card-dark": "#FAF8FC",
          "bg-light": "#0B0F19",
          "surface-light": "#111827",
          "border": "#E9E3F0",
          "text-primary": "#1A1025",
          "text-secondary": "#4A3E59",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
        heading: ["Sora", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["64px", { lineHeight: "1.2", fontWeight: "700" }],
        "display-lg": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "h1": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "h2": ["30px", { lineHeight: "1.2", fontWeight: "600" }],
        "h3": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["12px", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.25)",
        "glow-purple": "0 0 24px rgba(124, 58, 237, 0.35)",
        "glow-purple-xl": "0 0 30px rgba(124, 58, 237, 0.35)",
        "glow-green": "0 0 24px rgba(22, 196, 127, 0.35)",
      },
      animation: {
        "pulse-border": "pulse-border 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "vote-success": "vote-success 0.6s ease-out",
        "category-collapse": "category-collapse 0.4s ease-out forwards",
        "fade-slide-up": "fade-slide-up 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
      keyframes: {
        "pulse-border": {
          "0%, 100%": { borderColor: "rgba(22, 196, 127, 0.5)" },
          "50%": { borderColor: "rgba(124, 58, 237, 0.5)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 24px rgba(124, 58, 237, 0.35)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 30px rgba(124, 58, 237, 0.5)" },
        },
        "vote-success": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0.3", transform: "scale(1.05)" },
        },
        "category-collapse": {
          "0%": { opacity: "1", height: "auto" },
          "100%": { opacity: "0", height: "0" },
        },
        "fade-slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #16C47F 0%, #7C3AED 100%)",
        "gradient-cta": "linear-gradient(90deg, #16C47F, #A855F7)",
        "gradient-mesh": "radial-gradient(at 20% 50%, rgba(22, 196, 127, 0.1) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(124, 58, 237, 0.1) 0px, transparent 50%)",
      },
      transitionDuration: {
        "fast": "200ms",
        "medium": "400ms",
        "slow": "600ms",
      },
      spacing: {
        "4": "4px",
        "8": "8px",
        "12": "12px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "48": "48px",
        "64": "64px",
        "96": "96px",
      },
      backdropBlur: {
        "glass": "14px",
      },
    }
  },
  plugins: []
};

export default config;
