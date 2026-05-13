import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        grotesk: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#0a0908',
        fg: '#f5f1ea',
        accent: {
          DEFAULT: '#d4a574',
          dark: '#a8632d',
        },
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.6, 0.01, 0.05, 0.95)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
