---
name: Vibrant Modern
colors:
  surface: '#f9f9ff'
  surface-dim: '#cbdaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#051b3d'
  on-surface-variant: '#3f4753'
  inverse-surface: '#1d3053'
  inverse-on-surface: '#edf0ff'
  outline: '#707884'
  outline-variant: '#bfc7d5'
  surface-tint: '#0061a7'
  primary: '#0061a7'
  on-primary: '#ffffff'
  primary-container: '#0697ff'
  on-primary-container: '#002e53'
  inverse-primary: '#a0c9ff'
  secondary: '#185cb8'
  on-secondary: '#ffffff'
  secondary-container: '#689dfd'
  on-secondary-container: '#003371'
  tertiary: '#8142a3'
  on-tertiary: '#ffffff'
  tertiary-container: '#bb79dd'
  on-tertiary-container: '#4a016c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497f'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc7ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#f6d9ff'
  tertiary-fixed-dim: '#e7b3ff'
  on-tertiary-fixed: '#310049'
  on-tertiary-fixed-variant: '#672889'
  background: '#f9f9ff'
  on-background: '#051b3d'
  surface-variant: '#d8e2ff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin: 24px
---

# Design System Document

## Brand & Style
The brand identity has shifted from a warm, earthy tone to a vibrant, tech-forward aesthetic. It evokes feelings of precision, energy, and digital fluency. The style is **Corporate / Modern** with a lean towards high-energy digital interfaces, moving away from the previous heavy, grounded feel to something that feels lightweight and highly functional. It targets a professional audience that values clarity and modern performance.

## Colors
The palette is built on a vibrant logic, utilizing a spectrum of blues and purples to create a cool, professional atmosphere.
- **Primary (#0697ff):** A bright, electric blue used for main actions and focus states.
- **Secondary (#3c75d3):** A deeper blue for supporting elements and navigational accents.
- **Tertiary (#9c5cbe):** A royal purple used for highlights, notifications, or specific categorical differentiation.
- **Neutral (#65779e):** A slate-tinted grey-blue used for text and borders to maintain harmony with the cool-toned palette.

The system operates in a clean **Light Mode** to maximize readability and energy.

## Typography
The system has unified under **Inter**, a highly legible sans-serif designed for screens. This provides a more neutral, "Swiss" feel that scales perfectly from dense data grids to large marketing headlines.

*   **Headlines:** Use Inter with tighter letter-spacing and bolder weights (600-700) to create a strong hierarchy.
*   **Body:** Inter at standard weights (400) ensures high readability in long-form content.
*   **Labels:** Inter at medium weights (500) is used for buttons and small UI hints to maintain visibility at small sizes.

## Layout & Spacing
The layout follows a fluid grid philosophy with a base 8px (0.5rem) rhythm. Spacing is intentional and generous to prevent visual clutter.
*   **Grid:** A 12-column grid is used for desktop, collapsing to 4 columns on mobile.
*   **Rhythm:** Standardized 16px gutters provide breathing room between components, while 24px margins define the container's edge on mobile devices.

## Elevation & Depth
The design uses **Tonal Layers** and **Ambient Shadows**. Depth is communicated through subtle shifts in surface color (using the neutral palette) and soft, diffused shadows. Shadows are never pure black; they are tinted with the neutral-blue to ensure they feel like part of the environment.

## Shapes
The UI uses a **Rounded** language. This softens the technical nature of the Inter typeface and vibrant blues.
*   **Standard Components:** 0.5rem (8px) radius.
*   **Large Components (Cards):** 1rem (16px) radius.
*   **Extra Large (Modals):** 1.5rem (24px) radius.

## Components
*   **Buttons:** Primary buttons use the electric blue (#0697ff) with white text and 8px rounded corners.
*   **Input Fields:** Use the neutral-blue (#65779e) for borders with a 1px thickness, shifting to Primary blue on focus.
*   **Cards:** White backgrounds with level 1 ambient shadows and 16px rounded corners.
*   **Chips:** Utilize light tints of the primary and tertiary colors with pill-shaped rounding for high contrast against the standard rectangular UI.