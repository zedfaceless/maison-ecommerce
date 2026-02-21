import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf4f3",
          100: "#fce8e4",
          200: "#fad4cd",
          300: "#f5b5a9",
          400: "#ed8b78",
          500: "#e0644d",
          600: "#cc4830",
          700: "#ab3a25",
          800: "#8d3322",
          900: "#752f22",
          950: "#40150d",
        },
        midnight: {
          50: "#f4f6fb",
          100: "#e9ecf5",
          200: "#ced6e9",
          300: "#a3b2d6",
          400: "#7189be",
          500: "#4f6aa7",
          600: "#3d538c",
          700: "#324372",
          800: "#2c3a5f",
          900: "#293351",
          950: "#0f1322",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
