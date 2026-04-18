import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f7f2ea",
        ink: "#1f2937",
        pine: "#1d4ed8",
        clay: "#2563eb",
        mist: "#dbeafe",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(29, 78, 216, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(29, 78, 216, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
