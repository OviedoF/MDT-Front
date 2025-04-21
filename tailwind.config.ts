import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lightgreen: "#69816799",
        green: "#698167",
        "green-500": "#4BB543",
        darkgreen: "#4D5D4C",
        success: "#4BB543",
      },
    },
  },
  plugins: [],
} satisfies Config;
