import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        foreground: "#1A1A1A",
        primary: "#2A2A2A",
        secondary: "#6B6B6B",
        accent: "#4A5568",
      },
    },
  },
  plugins: [],
};
export default config;


