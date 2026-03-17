/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':      '#0f0f12',
        'bg-surface':   '#17171d',
        'bg-elevated':  '#1e1e26',
        'bg-hover':     '#25252f',
        'bg-active':    '#2d2d3a',
        'border-subtle':  '#ffffff0d',
        'border-soft':    '#ffffff18',
        'border-default': '#ffffff28',
        'text-primary':   '#e8e8f0',
        'text-secondary': '#9494a8',
        'text-tertiary':  '#5a5a70',
        'text-inverse':   '#0f0f12',
        accent:           '#7c6fff',
        'accent-hover':   '#9488ff',
        success:          '#4ade80',
        warning:          '#fbbf24',
        error:            '#f87171',
        info:             '#60a5fa',
      },
      fontFamily: {
        sans:  ["'DM Sans'",          'system-ui', 'sans-serif'],
        serif: ["'DM Serif Display'", 'Georgia',   'serif'],
        mono:  ["'DM Mono'", "'Fira Code'",        'monospace'],
      },
      boxShadow: {
        sm:   '0 1px 3px #00000040',
        md:   '0 4px 16px #00000050',
        lg:   '0 8px 32px #00000060',
        glow: '0 0 24px #7c6fff30',
      },
      keyframes: {
        'cursor-appear': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'cursor-appear': 'cursor-appear 0.2s ease',
        'cursor-blink':  'cursor-blink 1.2s ease infinite',
        'slide-down':    'slide-down 0.2s ease',
      },
    },
  },
  plugins: [],
};
