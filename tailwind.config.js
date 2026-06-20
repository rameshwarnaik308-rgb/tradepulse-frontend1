/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#080C14',
          card: '#0D1420',
          elevated: '#111927',
          hover: '#162133',
        },
        border: {
          DEFAULT: '#1E2D42',
          bright: '#2A3F5C',
        },
        text: {
          primary: '#E8F0FE',
          secondary: '#8FA3BF',
          muted: '#4A6080',
        },
        accent: {
          DEFAULT: '#00C2FF',
          dim: '#0088BB',
          glow: 'rgba(0,194,255,0.15)',
        },
        gold: '#FFB800',
        success: '#00E599',
        danger: '#FF4D6A',
        purple: '#A855F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 40px rgba(0,194,255,0.15)',
        'glow-green': '0 0 30px rgba(0,229,153,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
