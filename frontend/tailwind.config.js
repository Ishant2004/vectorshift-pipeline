/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette (VectorShift-inspired indigo/violet on slate).
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        ink: {
          DEFAULT: '#1c2536',
          soft: '#475467',
          faint: '#98a2b3',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',
          border: '#eaecf0',
        },
      },
      boxShadow: {
        node: '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.06)',
        'node-hover': '0 8px 24px rgba(16, 24, 40, 0.12)',
        panel: '0 4px 16px rgba(16, 24, 40, 0.06)',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
          'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
