import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glass: {
          1: 'rgba(255,255,255,0.035)',
          2: 'rgba(255,255,255,0.06)',
          3: 'rgba(255,255,255,0.09)'
        },
        accent: {
          violet: '#7C3AED',
          cyan: '#06B6D4',
          rose: '#F43F5E',
          amber: '#F59E0B',
          teal: '#14B8A6'
        },
        text: {
          primary: 'rgba(255,255,255,0.92)',
          secondary: 'rgba(255,255,255,0.55)',
          muted: 'rgba(255,255,255,0.28)'
        }
      },
      backdropBlur: {
        glass: '20px',
        heavy: '40px'
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'sentinelPulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        breath: 'sentimentBreath 2s ease-in-out infinite alternate'
      }
    }
  }
} satisfies Config
