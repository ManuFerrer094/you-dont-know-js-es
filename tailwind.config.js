/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ydkjs: {
          bg: '#0a0a0a',
          surface: '#141414',
          card: '#1a1a1a',
          border: '#2a2a2a',
          yellow: '#FFD600',
          'yellow-hover': '#FFE033',
          'yellow-dim': '#B39600',
          text: '#E8E8E8',
          'text-muted': '#888888',
          'text-dim': '#555555',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      typography: {
        ydkjs: {
          css: {
            '--tw-prose-body': '#E8E8E8',
            '--tw-prose-headings': '#FFFFFF',
            '--tw-prose-lead': '#BBBBBB',
            '--tw-prose-links': '#FFD600',
            '--tw-prose-bold': '#FFFFFF',
            '--tw-prose-counters': '#888888',
            '--tw-prose-bullets': '#FFD600',
            '--tw-prose-hr': '#2a2a2a',
            '--tw-prose-quotes': '#E8E8E8',
            '--tw-prose-quote-borders': '#FFD600',
            '--tw-prose-captions': '#888888',
            '--tw-prose-kbd': '#E8E8E8',
            '--tw-prose-code': '#FFD600',
            '--tw-prose-pre-code': '#E8E8E8',
            '--tw-prose-pre-bg': '#0a0a0a',
            '--tw-prose-th-borders': '#2a2a2a',
            '--tw-prose-td-borders': '#1a1a1a',
          },
        },
      },
    },
  },
  plugins: [],
}
