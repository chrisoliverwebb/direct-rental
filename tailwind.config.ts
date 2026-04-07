import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f7f2ea",
        ink: "#1f2937",
        pine: "#1f4d3f",
        clay: "#b3663d",
        mist: "#d9e6e0",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(31, 77, 63, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(31, 77, 63, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
