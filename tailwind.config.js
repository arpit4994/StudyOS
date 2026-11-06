
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090F",
        surface: "#13131D",
        violet: "#8B5CF6",
        accent: "#A78BFA",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
