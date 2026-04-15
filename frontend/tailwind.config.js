/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terminalBlack: '#050505',
        terminalGreen: '#00FF41',
        terminalRed: '#ff1f1f',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        flicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.45' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1, end) infinite',
        flicker: 'flicker 3s linear infinite',
      },
    },
  },
  plugins: [],
}

