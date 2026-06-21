---
name: Vibrant Tech
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
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
---

# Design System: Vibrant Tech

## Brand & Style
The brand personality has shifted from a warm, earthy tone to a vibrant, tech-forward aesthetic. It evokes a sense of modern energy, reliability, and precision. The style follows a **Corporate / Modern** approach with high-clarity interfaces and energetic blue accents. It aims to feel professional yet dynamic, moving away from the previous heavy, orange-dominant palette toward a more accessible and digital-native experience.

## Colors
The color palette is now centered around a vibrant primary blue (#0697ff) that serves as the core action color. The secondary blue (#3c75d3) provides depth and structural support, while a tertiary purple (#9c5cbe) is used for accents and highlights. The neutral palette has been cooled to a blue-grey (#65779e) to maintain harmony with the primary colors. This "vibrant" variant ensures high visibility and a clean, energetic look across the light-mode interface.

## Typography
The system has transitioned to **Inter** for all typographic roles. This change prioritizes legibility and a modern, neutral look that complements the updated color palette. Headlines are bold and clear, while body text uses standard weights for maximum readability. The use of a single variable font family ensures consistency across the platform and provides excellent performance in digital environments.

## Layout & Spacing
The layout uses a fluid grid system with a base spacing unit of 8px. It relies on a consistent 16px gutter between elements to maintain a balanced rhythm. On mobile devices, margins are tightened to 16px, while desktop views expand to allow for more white space. The spacing philosophy emphasizes clarity and the separation of distinct functional areas through logical padding and margins.

## Elevation & Depth
The UI uses **tonal layers** and subtle shadows to communicate hierarchy. Primary surfaces sit at a base level, while cards and modals use soft, low-opacity shadows tinted with the neutral blue-grey color to create a sense of floating depth without looking disconnected. This approach creates a clean, organized interface that guides the user's focus through elevation.

## Shapes
The design has moved from sharp, square corners to a **Rounded** shape language. Standard UI elements like buttons and input fields now feature a 0.5rem (8px) corner radius. Larger containers like cards use a 1rem (16px) radius, and specialized components like pills or large banners use a 1.5rem (24px) radius. This softening of the edges makes the interface feel more approachable and modern.

## Components
- **Buttons:** Feature the primary vibrant blue (#0697ff) with white text and 8px rounded corners.
- **Input Fields:** Use a subtle neutral-blue border that thickens and turns primary blue on focus.
- **Cards:** White or very light-grey background with a soft shadow and 16px rounded corners.
- **Chips:** Utilize the tertiary purple (#9c5cbe) or secondary blue (#3c75d3) for categorization with low-opacity backgrounds.
- **Checkboxes & Radios:** Use the primary blue for selected states to ensure high visibility against the neutral background.