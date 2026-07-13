/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // VectorShift palette — black accent on warm paper, near-black ink.
        // `brand` is the primary accent (black) with a warm-neutral tonal ramp.
        brand: {
          50: '#F2F0EA',
          100: '#E4E1D8',
          400: '#54585F',
          500: '#20242C',
          600: '#0F131A', // --ink (primary accent)
          700: '#000000',
        },
        ink: {
          DEFAULT: '#0F131A', // --ink
          soft: '#54585F',    // --muted
          faint: '#8B867D',   // --dim
        },
        surface: {
          DEFAULT: '#FFFEFB', // --bg (cards / panels)
          muted: '#FCF9F0',   // --bg-alt (canvas / subtle fills)
          border: '#D9D3C5',  // --rule
        },
        rule: {
          DEFAULT: '#D9D3C5', // --rule
          dk: '#BFB7A4',      // --rule-dk
        },
      },
      boxShadow: {
        node: '0 1px 3px rgba(15, 19, 26, 0.06), 0 1px 2px rgba(15, 19, 26, 0.05)',
        'node-hover': '0 8px 24px rgba(15, 19, 26, 0.10)',
        panel: '0 4px 16px rgba(15, 19, 26, 0.05)',
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
