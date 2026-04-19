/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#00d4ff',
        secondary:'#0066ff',
        dark:     '#0a0e1a',
        darker:   '#060810',
        card:     '#0d1526',
        border:   '#1a2a4a',
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'Courier New', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
        body:    ['"Rajdhani"', 'sans-serif'],
      },
      keyframes: {
        glow: {
          from: { textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff' },
          to:   { textShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #0066ff' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        glow:       'glow 2s ease-in-out infinite alternate',
        scan:       'scan 4s linear infinite',
        float:      'float 6s ease-in-out infinite',
        fadeInUp:   'fadeInUp 0.6s ease forwards',
        blink:      'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
