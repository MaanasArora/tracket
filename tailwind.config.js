/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fff4e6",
        text: "#242424",
        dark: "#242424",
        primary: {
          200: "#f9e0b8",
          400: "#ff8c00",
          500: "#f17b00",
          600: "#d45e00",
        },
      },
    },
  },
  plugins: [],
};
