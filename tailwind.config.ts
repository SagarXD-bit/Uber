import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: "#000000",
          green: "#06C167",
          gray: "#EEEEEE",
          muted: "#6B6B6B",
          card: "#F3F3F3",
        },
      },
      fontFamily: {
        sans: ["UberMove", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
