import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        'surface-subtle': 'var(--bg-surface-subtle)',
        'card-bg': 'var(--bg-card)',
        'card-elevated': 'var(--bg-card-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-lime': '#E3EF26',
        'accent-teal': '#076653',
        'deep-forest': '#0C342C',
        'abyssal-dark': '#06231D',
        'void-black': '#041411',
      },
      backgroundImage: {
        'gradient-dark-command': 'linear-gradient(135deg, #E3EF26 0%, #076653 50%, #0C342C 100%)',
        'gradient-light-eco': 'linear-gradient(135deg, #E2FBCE 0%, #E3EF26 50%, #076653 100%)',
        'gradient-abyssal': 'linear-gradient(180deg, #0C342C 0%, #06231D 50%, #041411 100%)',
      }
    }
  }
}

export default config
