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
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
---

# Design System: Vibrant Modern

## Brand & Style
The brand identity has shifted from a warm, earthy tone to a vibrant, tech-forward, and energetic personality. The "Vibrant Modern" style leverages a bright "Inter" based typographic system and a high-energy blue-centric palette to evoke feelings of innovation, precision, and digital fluency.

The UI follows a **Corporate / Modern** aesthetic with a lean toward **Minimalism**. It emphasizes clarity, functional beauty, and a clean interface where whitespace is used strategically to let the new, more active primary colors drive the user's focus. The overall atmosphere is professional yet high-spirited and approachable.

## Colors
The color palette has been refreshed to a "Vibrant" variant, moving away from warm oranges to a cool, energetic spectrum. 

- **Primary (#0697ff):** A bright, digital blue used for primary actions, active states, and brand-defining elements.
- **Secondary (#3c75d3):** A deeper, supportive blue for secondary interactions and structural accents.
- **Tertiary (#9c5cbe):** A vibrant purple used for highlights, notifications, or to distinguish specific feature sets.
- **Neutral (#65779e):** A cool-toned slate gray used for text, borders, and subtle backgrounds to maintain a cohesive cool temperature across the UI.

The system operates in a **Light Mode** by default, emphasizing a clean white background with high-contrast vibrant accents.

## Typography
The system now exclusively uses **Inter** for all typographic roles. Inter provides a highly legible, modern, and neutral geometric look that complements the vibrant color palette.

- **Headlines:** Use Bold and Semi-Bold weights to create a strong visual hierarchy.
- **Body:** Set in Regular weight for maximum readability.
- **Labels:** Use Medium weight and slightly smaller sizes for functional metadata and UI controls.

The scale is designed to be responsive, with large headlines naturally stepping down for mobile viewports to ensure accessibility and layout integrity.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on an 8px spacing system (unit scale of 2). This ensures a predictable rhythm across all components.

- **Gutters:** 16px to maintain clear separation between content blocks.
- **Margins:** 24px on desktop, scaling down to 16px on mobile.
- **Rhythm:** All padding and margins should be multiples of the 8px base unit to ensure visual consistency and vertical alignment.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows**. Instead of heavy shadows, the system uses soft, diffused elevations that are slightly tinted with the neutral slate color to maintain the cool aesthetic. 

Higher elevation levels indicate interactive priority (like modals or dropdowns), while lower levels are used for card containers. Semi-transparent neutral overlays are used to create subtle depth without cluttering the interface.

## Shapes
The shape language has transitioned from sharp, 0px corners to a **Rounded** aesthetic (Level 2). This change softens the high-contrast vibrant colors and makes the interface feel more modern and user-friendly.

- **Standard Elements:** 0.5rem (8px) corner radius.
- **Large Containers (Cards):** 1rem (16px) corner radius.
- **Extra Large (Modals):** 1.5rem (24px) corner radius.

## Components
- **Buttons:** Feature 8px rounded corners. Primary buttons use the vibrant blue (#0697ff) with white text.
- **Input Fields:** Use the neutral-toned slate for borders, adopting a 2px stroke when focused in the primary blue.
- **Cards:** Utilize a 16px (rounded-lg) corner radius with a very subtle ambient shadow for definition.
- **Chips & Tags:** Use the tertiary purple (#9c5cbe) or secondary blue (#3c75d3) with low-opacity backgrounds for categorizing content.
- **Checkboxes/Radios:** Adopt the rounded-sm styling with primary blue fill for the active state.