/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        red: {
          400: '#ff6b57',
          500: '#ff2400',
          600: '#e62000',
          700: '#b31900',
          800: '#801200',
          900: '#4d0b00',
        },
        obsidian: {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#242424',
          500: '#2d2d2d',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(255, 36, 0, 0.5), 0 0 40px rgba(255, 36, 0, 0.3)',
        'glow-red-strong': '0 0 30px rgba(255, 36, 0, 0.8), 0 0 60px rgba(255, 36, 0, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        // Adicionado: Animações do GlitchText
        'glitch-after': 'glitch var(--after-duration) infinite linear alternate-reverse',
        'glitch-before': 'glitch var(--before-duration) infinite linear alternate-reverse',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 36, 0, 0.5)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 36, 0, 0.8)' },
        },
        // Adicionado: Keyframes do GlitchText
        glitch: {
          "0%": { "clip-path": "inset(20% 0 50% 0)" },
          "5%": { "clip-path": "inset(10% 0 60% 0)" },
          "10%": { "clip-path": "inset(15% 0 55% 0)" },
          "15%": { "clip-path": "inset(25% 0 35% 0)" },
          "20%": { "clip-path": "inset(30% 0 40% 0)" },
          "25%": { "clip-path": "inset(40% 0 20% 0)" },
          "30%": { "clip-path": "inset(10% 0 60% 0)" },
          "35%": { "clip-path": "inset(15% 0 55% 0)" },
          "40%": { "clip-path": "inset(25% 0 35% 0)" },
          "45%": { "clip-path": "inset(30% 0 40% 0)" },
          "50%": { "clip-path": "inset(20% 0 50% 0)" },
          "55%": { "clip-path": "inset(10% 0 60% 0)" },
          "60%": { "clip-path": "inset(15% 0 55% 0)" },
          "65%": { "clip-path": "inset(25% 0 35% 0)" },
          "70%": { "clip-path": "inset(30% 0 40% 0)" },
          "75%": { "clip-path": "inset(40% 0 20% 0)" },
          "80%": { "clip-path": "inset(20% 0 50% 0)" },
          "85%": { "clip-path": "inset(10% 0 60% 0)" },
          "90%": { "clip-path": "inset(15% 0 55% 0)" },
          "95%": { "clip-path": "inset(25% 0 35% 0)" },
          "100%": { "clip-path": "inset(30% 0 40% 0)" },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};