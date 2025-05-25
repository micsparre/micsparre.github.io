/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "neon-green": "#39ff14",
        "neon-pink": "#ff00ff",
        "neon-cyan": "#00ffff",
        "neon-blue": "#00bfff",
        "neon-yellow": "#ffff33",
        "neon-orange": "#ff9933",
        "neon-purple": "#cc00ff",
        "dark-blue": "#0a0a23",
      },
    },
  },
  plugins: [],
};
