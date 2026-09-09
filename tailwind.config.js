/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0f1117",
        cardBg: "#161922",
        cardBorder: "#262a35",
        accentOrange: "#f2a93b",
        accentOrangeHover: "#e0982a",
        positiveGreen: "#4ade80",
        overdueRed: "#f87171",
        overdueAmber: "#fbbf24",
      },
    },
  },
  plugins: [],
}
