import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          gray: {
            50: '#F5F5F7',
            100: '#E8E8ED',
            200: '#D2D2D7',
            300: '#AEAEB2',
            400: '#8E8E93',
            500: '#636366',
            600: '#48484A',
            700: '#3A3A3C',
            800: '#2C2C2E',
            900: '#1C1C1E',
          }
        },
        diff: {
          added: 'rgba(52, 199, 89, 0.2)',
          addedText: '#1D7A34',
          addedBorder: 'rgba(52, 199, 89, 0.4)',
          removed: 'rgba(255, 59, 48, 0.15)',
          removedText: '#C41E10',
          removedBorder: 'rgba(255, 59, 48, 0.3)',
          // Dark mode variants
          addedDark: 'rgba(52, 199, 89, 0.25)',
          addedTextDark: '#32D74B',
          removedDark: 'rgba(255, 69, 58, 0.2)',
          removedTextDark: '#FF6961',
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      boxShadow: {
        'apple': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'apple-inset': 'inset 0 1px 3px rgba(0, 0, 0, 0.06)',
        'apple-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
        'apple-lg-dark': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      backdropBlur: {
        'apple': '20px',
      }
    },
  },
  plugins: [],
}
export default config
