import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary & Semantic
        primary: '#0061a7',
        'primary-container': '#0697ff',
        'on-primary': '#ffffff',
        'on-primary-container': '#0a2e5f',

        // Secondary
        secondary: '#772cd8',
        'secondary-container': '#914cf2',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#3d0d7a',

        // Tertiary
        tertiary: '#006a66',
        'tertiary-container': '#00a59f',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#002c2a',

        // Neutral surfaces
        surface: '#f8f9ff',
        'surface-dim': '#e8eaf7',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d1e1ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3f4753',

        // Background
        background: '#f8f9ff',
        'on-background': '#0b1c30',

        // Inverse
        'inverse-surface': '#0f1c30',
        'inverse-on-surface': '#f1f0ff',
        'inverse-primary': '#0697ff',

        // Error
        error: '#d0453f',
        'on-error': '#ffffff',
        'error-container': '#f9dedb',
        'on-error-container': '#410e0b',

        // Outline
        outline: '#707884',
        'outline-variant': '#bfc7d5',
      },

      fontSize: {
        // Page hero / very large title (48px per Stitch)
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700' }],

        // Page title / main page heading (32px per Stitch)
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],

        // Section heading (24px per Stitch)
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],

        // Card title / important card heading (18px per Stitch)
        'headline-sm': ['18px', { lineHeight: '28px', fontWeight: '600' }],

        // Body text / descriptions (18px per Stitch)
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],

        // Primary body text (16px per Stitch)
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],

        // Navigation / sidebar / tabs / buttons (14px per Stitch)
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],

        // Navigation labels (14px per Stitch)
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],

        // Secondary text / labels / metadata (12px per Stitch)
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],

        // Tiny meta text (12px per Stitch)
        'label-xs': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        gutter: 'var(--spacing-gutter)',
        'margin-mobile': 'var(--spacing-margin-mobile)',
        'container-max': '1280px',
      },

      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '8px',
        xl: '12px',
        '2xl': '24px',
        full: '9999px',
      },

      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        md: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        lg: '0 12px 24px 0 rgba(0, 0, 0, 0.12)',
        xl: '0 16px 32px 0 rgba(0, 0, 0, 0.15)',
      },

      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '2rem',
        },
      },

      animation: {
        spin: 'spin 1s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
