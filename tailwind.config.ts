import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#08080C",
          900: "#0D0D14",
          850: "#111118",
          800: "#181822",
          700: "#222230",
        },
        crimson: {
          950: "#450A0A",
          900: "#7F1D1D",
          800: "#991B1B",
          700: "#B91C1C",
          600: "#DC2626",
          500: "#EF4444",
          400: "#F87171",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "crimson-gradient": "linear-gradient(135deg, #7F1D1D 0%, #DC2626 55%, #EF4444 100%)",
        "obsidian-radial": "radial-gradient(circle at top center, rgba(220, 38, 38, 0.16), transparent 60%)",
      },
      boxShadow: {
        crimson: "0 10px 30px -10px rgba(220, 38, 38, 0.45)",
        card: "0 18px 40px -18px rgba(0, 0, 0, 0.75)",
      },
    },
  },
  plugins: [],
};

export default config;
