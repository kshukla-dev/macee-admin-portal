/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Macee Website Color System
        brand: {
          red: '#E30613',           // Primary Brand Red (Website top border, .is-btn, active tabs)
          redHover: '#111827',      // Primary hover to charcoal black
          periwinkle: '#8E96CB',    // Secondary Brand Color (.is-btn-secondary, shadows, tags)
          navy: '#36427D',          // Dark Navy (.is-btn-secondary hover, deep accents)
          navyLight: '#6D78AF',     // Accent navy light
          dark: '#111827',          // Charcoal Black (Footer, sidebar, primary text)
          card: '#F0F3FA',          // Soft Card Background (.card-pink)
          cardLight: '#F8FAFB',     // Alternate section / hover background
          white: '#FFFFFF',         // Pure White page & card surface
        },
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'macee-btn': '0 4px 14px -2px rgba(227, 6, 19, 0.28)',
        'macee-secondary': '0 4px 12px -2px rgba(142, 150, 203, 0.3)',
        'hard': '20px 20px 0 0 rgba(142, 150, 203, 0.25)',
        'hard-sm': '8px 8px 0 0 rgba(142, 150, 203, 0.25)',
        'card-soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(142, 150, 203, 0.15), 0 8px 10px -6px rgba(17, 24, 39, 0.04)',
      },
      borderRadius: {
        'btn': '10px',
        'card': '20px',
      },
    },
  },
  plugins: [],
};
