/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    // Two themes so the navbar toggle has something to switch between.
    // "dark" is listed first, which makes it the default (the brief asks for a dark theme).
    themes: ["dark", "light"],
    darkTheme: "dark",
  },
};
