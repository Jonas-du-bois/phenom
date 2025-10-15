/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'violet-mystique': '#9973BF',
        'bleu-nuit': '#1E2640',
        'bleu-profond': '#324873',
        'noir-bleute': '#111826',
        'noir-profond': '#0D0D0D',
      }
    },
  },
  plugins: [],
}
