/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Phenom Search Design System - Primary Colors
        'phenom-cyan': '#00F0FF',
        'phenom-cyan-hover': '#00D0DF',
        'phenom-black': '#000000',
        'phenom-navy': '#080A0E',
        'phenom-card': '#12151C',
        'phenom-card-dark': '#0a0e14',
        // Gradient colors
        'phenom-blue': '#0066CC',
        'phenom-blue-dark': '#002288',
        // Legacy colors (for backward compatibility)
        'violet-mystique': '#9973BF',
        'bleu-nuit': '#1E2640',
        'bleu-profond': '#324873',
        'noir-bleute': '#111826',
        'noir-profond': '#0D0D0D',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'hero': ['8.5rem', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'h1': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'h2': ['2.5rem', { lineHeight: '1.1', letterSpacing: '0.05em' }],
        'h3': ['1.5rem', { lineHeight: '1.2', letterSpacing: '0.05em' }],
        'h4': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0.05em' }],
        'h5': ['1.125rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.95rem', { lineHeight: '1.6' }],
        'label': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.1em' }],
        'caption': ['0.8rem', { lineHeight: '1.5' }],
        'micro': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.15em' }],
        'nano': ['0.7rem', { lineHeight: '1.3' }],
        'pico': ['0.65rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'xs': '0.125rem',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-cyan-lg': '0 8px 32px rgba(0, 240, 255, 0.1)',
      },
      backdropBlur: {
        'xl': '24px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
