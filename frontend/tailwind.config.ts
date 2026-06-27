import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d7dde5",
        panel: "#ffffff",
        ink: "#172033",
        muted: "#5d6b82",
        accent: "#0f766e",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(23, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
