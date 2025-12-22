import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        diff: {
          added: '#d1f5d3',
          addedDark: '#acf2bd',
          removed: '#ffd7d5',
          removedDark: '#ffb3b0',
        }
      }
    },
  },
  plugins: [],
}
export default config
