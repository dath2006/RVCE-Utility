/** @type {import('tailwindcss').Config} */
// Calm-study status scales: muted hues so legacy emerald/rose/amber/sky classes read as sage, brick, ochre and dusk.
const steps = { 50: 96, 100: 92, 200: 85, 300: 74, 400: 62, 500: 50, 600: 41, 700: 33, 800: 25, 900: 18, 950: 11 };
const scale = (h, sat) =>
  Object.fromEntries(
    Object.entries(steps).map(([k, l]) => [k, `hsl(${h} ${sat}% ${l}% / <alpha-value>)`]),
  );
const calm = {
  emerald: scale(152, 26),
  green: scale(152, 26),
  teal: scale(170, 24),
  rose: scale(8, 42),
  red: scale(6, 44),
  amber: scale(38, 52),
  yellow: scale(42, 50),
  orange: scale(24, 48),
  sky: scale(214, 34),
  blue: scale(220, 34),
  cyan: scale(200, 30),
  violet: scale(232, 28),
  indigo: scale(232, 30),
  fuchsia: scale(236, 24),
  purple: scale(236, 24),
  slate: scale(224, 14),
};

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Hanken Grotesk", "Inter Variable", "sans-serif"],
        display: ["Libre Caslon Display", "ui-serif", "Georgia", "serif"],
        inter: ["Inter Variable", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        ...calm,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        soft: "0 20px 80px -28px hsl(var(--foreground) / 0.22)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
