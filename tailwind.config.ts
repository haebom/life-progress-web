import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        secondary: {
          light: '#f3f4f6',
          dark: '#2d2d2d',
        },
        text: {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
        accent: {
          light: '#3b82f6',
          dark: '#60a5fa',
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
