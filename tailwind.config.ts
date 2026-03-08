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
        background: "var(--background)",
        foreground: "var(--foreground)",
        warisan: {
            50: "#e7ebf2",
            100: "#cfd7e6",
            200: "#a1b0cc",
            300: "#7388b3",
            400: "#456199",
            500: "#1f3f7a",
            600: "#163361",
            700: "#0f274a",
            800: "#091b34",
            900: "#041021",
            950: "#020811",
        },
        "warisan-sky": {
            50: "#e9f9ff",
            100: "#d0f2ff",
            200: "#a6e7ff",
            300: "#74dbff",
            400: "#4fd1ff",
            500: "#46caff",
            600: "#1aaee6",
            700: "#0f88b3",
            800: "#0b6380",
            900: "#083f52",
            950: "#042736",
        },
        "warisan-accent": {
            50: "#ffe8e8",
            100: "#ffcccc",
            200: "#ff9999",
            300: "#ff6666",
            400: "#ff3333",
            500: "#ff0000",
            600: "#cc0000",
            700: "#990000",
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
