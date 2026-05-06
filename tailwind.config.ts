import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Green + Purple
        primary: {
          green: '#14B8A6',
          'green-deep': '#0F766E',
          purple: '#6366F1',
          'purple-deep': '#4338CA',
        },
        // Accent Colors
        accent: {
          lime: '#A3E635',
          violet: '#8B5CF6',
          mint: '#2DD4BF',
          gold: '#F59E0B',
          red: '#F43F5E',
        },
        // Neutral Colors
        neutral: {
          'bg-dark': '#0B1120',
          'surface-dark': '#0F172A',
          'card-dark': '#111C33',
          'bg-light': '#0B1120',
          'surface-light': '#111827',
          border: '#1F2A44',
          'text-primary': '#F8FAFC',
          'text-secondary': '#CBD5F5',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
        heading: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['30px', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 18px 50px rgba(2, 6, 23, 0.45)',
        'glow-purple': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-purple-xl': '0 0 40px rgba(99, 102, 241, 0.4)',
        'glow-green': '0 0 26px rgba(20, 184, 166, 0.4)',
      },
      letterSpacing: {
        display: '-0.03em',
        heading: '-0.02em',
      },
      animation: {
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'vote-success': 'vote-success 0.6s ease-out',
        'category-collapse': 'category-collapse 0.4s ease-out forwards',
        'fade-slide-up': 'fade-slide-up 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(22, 196, 127, 0.5)' },
          '50%': { borderColor: 'rgba(124, 58, 237, 0.5)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 24px rgba(124, 58, 237, 0.35)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
          },
        },
        'vote-success': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0.3', transform: 'scale(1.05)' },
        },
        'category-collapse': {
          '0%': { opacity: '1', height: 'auto' },
          '100%': { opacity: '0', height: '0' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)',
        'gradient-cta': 'linear-gradient(90deg, #14B8A6, #8B5CF6)',
        'gradient-mesh':
          'radial-gradient(at 20% 20%, rgba(20, 184, 166, 0.25) 0px, transparent 55%), radial-gradient(at 80% 10%, rgba(99, 102, 241, 0.18) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(56, 189, 248, 0.12) 0px, transparent 60%)',
      },
      transitionDuration: {
        fast: '200ms',
        medium: '400ms',
        slow: '600ms',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
        '96': '96px',
      },
      backdropBlur: {
        glass: '14px',
      },
    },
  },
  plugins: [],
}

export default config
