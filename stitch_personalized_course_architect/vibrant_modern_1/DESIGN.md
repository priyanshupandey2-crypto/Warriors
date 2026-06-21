---
name: Vibrant Modern
colors:
  surface: '#f5f6ff'
  surface-dim: '#c2d4ff'
  surface-bright: '#f5f6ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf0ff'
  surface-container: '#e0e8ff'
  surface-container-high: '#d8e2ff'
  surface-container-highest: '#cfddff'
  on-surface: '#1b2e51'
  on-surface-variant: '#495b81'
  inverse-surface: '#000d28'
  inverse-on-surface: '#8b9dc6'
  outline: '#65779e'
  outline-variant: '#9badd7'
  surface-tint: '#005ea2'
  primary: '#005ea2'
  on-primary: '#edf3ff'
  primary-container: '#4ba4ff'
  on-primary-container: '#002443'
  inverse-primary: '#0497ff'
  secondary: '#1259b5'
  on-secondary: '#f0f2ff'
  secondary-container: '#bed2ff'
  on-secondary-container: '#004594'
  tertiary: '#7e3fa0'
  on-tertiary: '#feeeff'
  tertiary-container: '#da96fd'
  on-tertiary-container: '#4e0971'
  error: '#b31b25'
  on-error: '#ffefee'
  error-container: '#fb5151'
  on-error-container: '#570008'
  primary-fixed: '#4ba4ff'
  primary-fixed-dim: '#0497ff'
  on-primary-fixed: '#000000'
  on-primary-fixed-variant: '#002d53'
  secondary-fixed: '#bed2ff'
  secondary-fixed-dim: '#a8c4ff'
  on-secondary-fixed: '#003270'
  on-secondary-fixed-variant: '#004ea6'
  tertiary-fixed: '#da96fd'
  tertiary-fixed-dim: '#cc88ee'
  on-tertiary-fixed: '#2b0042'
  on-tertiary-fixed-variant: '#58177a'
  primary-dim: '#00528e'
  secondary-dim: '#004da4'
  tertiary-dim: '#713293'
  error-dim: '#9f0519'
  background: '#f5f6ff'
  on-background: '#1b2e51'
  surface-variant: '#cfddff'
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
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

# Design System: Vibrant Modern

## Brand & Style
The brand identity has shifted from a warm, earthy tone to a vibrant, tech-forward aesthetic. This style is characterized by energetic blues and purples, evoking a sense of innovation, clarity, and digital fluency.

We utilize a **Corporate / Modern** style with a hint of **Vibrant** energy. The interface prioritizes high legibility and a balanced professional feel, but uses saturated primary and tertiary accents to create a dynamic and engaging user experience. The atmosphere is confident, reliable, and forward-looking.

## Colors
The color palette is built on a "Vibrant" logic, replacing previous warm oranges with a logic-driven blue scale.

- **Primary (#0697ff):** A bright, electric blue used for main actions, active states, and brand recognition.
- **Secondary (#3c75d3):** A deeper, more muted blue for supporting UI elements and visual grouping.
- **Tertiary (#9c5cbe):** A royal purple used for accents, highlights, and differentiating specific feature sets.
- **Neutral (#65779e):** A cool, blue-tinted slate used for text, borders, and subtle backgrounds to maintain harmony with the primary palette.

The system operates in a **Light Mode** default, utilizing clean white surfaces with cool-toned neutral borders.

## Typography
We have transitioned to **Inter** across all typographic roles to provide a highly legible, neutral, and modern appearance that performs exceptionally well on digital screens.

- **Headlines:** Use Inter with tighter tracking and semi-bold to bold weights for strong hierarchy.
- **Body:** Inter at regular weights for maximum readability.
- **Labels:** Inter Medium for UI metadata, buttons, and small captions.

For mobile devices, large headlines (32px+) should scale down to 28px to ensure they don't break across multiple lines awkwardly.

## Layout & Spacing
The system uses a **Fluid Grid** model. Content expands to fill the container while maintaining consistent internal rhythms based on an 8px baseline.

- **Desktop:** 12-column grid with 24px margins.
- **Tablet:** 8-column grid with 16px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing between related elements should follow the 8px or 4px increments to ensure a tight, organized visual structure.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows**. 

Instead of heavy borders, we use subtle, low-opacity shadows (tinted with the Neutral color) to lift cards and modals from the background. Surfaces use the Neutral palette to create "container tiers," where the background is slightly off-white and interactive cards are pure white.

## Shapes
The design has moved away from sharp edges to a **Rounded** aesthetic. This provides a more approachable and modern feel.

- **Standard Components (Buttons, Inputs):** 0.5rem (8px) corner radius.
- **Large Components (Cards, Modals):** 1rem (16px) corner radius.
- **Extra Large (Hero Sections):** 1.5rem (24px) corner radius.

## Components
- **Buttons:** Filled with the Primary blue for high-priority actions. Secondary actions use the Secondary blue as an outline or ghost style.
- **Inputs:** 0.5rem rounded corners with a subtle 1px border using the Neutral slate color.
- **Cards:** White background with a 1rem corner radius and a soft, cool-tinted shadow.
- **Chips:** Highly rounded (pill-shaped) using the Tertiary purple for special status indicators or categories.