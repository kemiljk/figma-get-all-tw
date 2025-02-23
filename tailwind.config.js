/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "figma-bg": "var(--figma-color-bg)",
        "figma-primary": "var(--figma-color-text)",
        "figma-secondary": "var(--figma-color-text-secondary)",
        "figma-border": "var(--figma-color-border)",
        "figma-secondaryBg": "var(--figma-color-bg-secondary)",
        "figma-secondaryBg-hover": "var(--figma-color-bg-hover)",
        "figma-blue": "var(--figma-color-bg-brand)",
      },
      animation: {
        in: "in 200ms ease-in",
        out: "out 150ms ease-out",
      },
      keyframes: {
        in: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        out: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(4px)" },
        },
      },
    },
  },
  plugins: [],
};
