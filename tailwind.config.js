/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#faecd8',
          200: '#f5d5a8',
          300: '#efb96e',
          400: '#e8963a',
          500: '#d4751f',
          600: '#b85c14',
          700: '#964513',
          800: '#7a3815',
          900: '#642f14',
        },
        ink: {
          50: '#f6f5f3',
          100: '#eceae6',
          200: '#d5d1c9',
          300: '#b8b3a8',
          400: '#968f82',
          500: '#7a7367',
          600: '#625c52',
          700: '#504a42',
          800: '#423d37',
          900: '#1a1713',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
