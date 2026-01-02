/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6E9F7',   // Lightest tint
          100: '#CCD2EF',  // Very light
          200: '#99A5DF',  // Light
          300: '#6678CF',  // Medium light
          400: '#334BBF',  // Medium
          500: '#001BB7',  // Main brand color
          600: '#0015A0',  // Darker for hover
          700: '#001089',  // Dark
          800: '#000B72',  // Very dark
          900: '#00065B',  // Darkest
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',  // Positive sentiment
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',  // Neutral sentiment
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',  // Negative sentiment
          600: '#DC2626',
          700: '#B91C1C',
        },
        dark: {
          900: '#1F2937',  // Headings
          800: '#1F2937',
          700: '#374151',  // Body text
          600: '#4B5563',
          500: '#6B7280',  // Secondary text
          400: '#9CA3AF',
        },
        light: {
          50: '#F9FAFB',
          100: '#F3F4F6',  // Backgrounds
          200: '#E5E7EB',  // Borders
          300: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'modal': '0 20px 50px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

