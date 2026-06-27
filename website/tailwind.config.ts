import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { violet: '#7C3AED', cyan: '#06B6D4', rose: '#F43F5E', amber: '#F59E0B', teal: '#14B8A6' },
        text: { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.28)' }
      }
    }
  }
} satisfies Config
