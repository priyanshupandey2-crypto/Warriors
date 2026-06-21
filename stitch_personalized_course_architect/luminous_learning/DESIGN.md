---
name: Luminous Learning
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4753'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707884'
  outline-variant: '#bfc7d5'
  surface-tint: '#0061a7'
  primary: '#0061a7'
  on-primary: '#ffffff'
  primary-container: '#0697ff'
  on-primary-container: '#002e53'
  inverse-primary: '#a0c9ff'
  secondary: '#772cd8'
  on-secondary: '#ffffff'
  secondary-container: '#914cf2'
  on-secondary-container: '#fffbff'
  tertiary: '#006a66'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a59f'
  on-tertiary-container: '#003330'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497f'
  secondary-fixed: '#ecdcff'
  secondary-fixed-dim: '#d6baff'
  on-secondary-fixed: '#280056'
  on-secondary-fixed-variant: '#6000bf'
  tertiary-fixed: '#65f8f0'
  tertiary-fixed-dim: '#3fdbd4'
  on-tertiary-fixed: '#00201e'
  on-tertiary-fixed-variant: '#00504d'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
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
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

This design system is built for an EdTech platform that prioritizes clarity, momentum, and engagement. The brand personality is **optimistic, energetic, and supportive**, designed to reduce the cognitive load of learning while maintaining a high-energy atmosphere. 

The aesthetic follows a **Corporate Modern** style infused with **vibrant accents**. It utilizes a clean white foundation to ensure readability, while "Electric Blue" acts as a catalyst for action. The interface should feel premium and professional but approachable, avoiding the coldness of traditional enterprise software in favor of a "human-centric" educational tool.

## Colors

The palette is anchored by **Electric Blue (#0697FF)**, used for primary actions and progress indicators. **Soft Purple (#9D59FF)** is reserved for secondary highlights, such as gamification elements or completed milestones, while **Teal (#00C2BB)** denotes success and specialized categorical tagging.

The background is a pure, crisp white (#FFFFFF) to maximize contrast. We use a "Slate" neutral scale for text and borders to maintain a softer, more modern appearance than pure black, ensuring the vibrant primary colors remain the focus.

## Typography

**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in digital learning environments. 

- **Headlines:** Use tighter letter-spacing and heavier weights (SemiBold/Bold) to create a sense of authority and structure.
- **Body Text:** Standard weight (400) with generous line heights to facilitate long-form reading and lesson comprehension.
- **Interactive Labels:** Slightly heavier weights (Medium/SemiBold) to differentiate clickable elements from static content.
- **Scaling:** On mobile, display and large headline sizes scale down to prevent excessive line-breaking and maintain a clean vertical rhythm.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile devices. 

- **Rhythm:** An 8px spacing system governs all layouts.
- **Margins:** Desktop containers use 24px gutters with a 1280px max-width to keep content focused and readable. Mobile layouts use 16px side margins to maximize screen real estate.
- **White Space:** High-level sections (like different modules in a course) should be separated by `xxl` (48px) spacing to prevent the UI from feeling cluttered or overwhelming to the student.

## Elevation & Depth

To maintain an approachable and high-quality feel, depth is created through **Ambient Shadows** rather than harsh borders.

- **Level 0 (Flat):** Used for the main background and decorative elements.
- **Level 1 (Subtle):** Used for cards and persistent navigation bars. A soft, low-opacity shadow (4% - 6% alpha) with a large blur radius (12px - 16px).
- **Level 2 (Active):** Used for hovered states and dropdown menus. The shadow becomes slightly more pronounced (10% alpha) to indicate "lift."
- **Tonal Layering:** Occasional use of a light grey (#F8FAFC) surface container is encouraged to group related content without adding shadow complexity.

## Shapes

The design system employs **Soft Rounding** across all components. A base radius of **8px (0.5rem)** is applied to buttons, input fields, and small cards. 

Larger containers, such as course module previews or modal windows, should use `rounded-lg` (16px) to emphasize the friendly, non-intimidating nature of the platform. Progress bars and status chips should use the **Pill** shape for a distinct visual contrast against rectangular content blocks.

## Components

- **Buttons:** Primary buttons use the Electric Blue background with white text. They feature an 8px radius and a subtle lift on hover. "Ghost" buttons (outline only) are used for secondary actions to maintain hierarchy.
- **Input Fields:** Use a light grey border (#E2E8F0) that transitions to Electric Blue on focus. Labels should always be visible above the field for accessibility.
- **Course Cards:** Utilize Level 1 elevation. Images within cards should inherit the 8px top-corner radius.
- **Progress Bars:** Use a thick (8px) height with a light grey track and a Teal or Electric Blue fill. The ends are always fully rounded (pill).
- **Chips/Badges:** Small, pill-shaped elements with low-opacity background tints of the primary colors (e.g., 10% Teal background with 100% Teal text) for categorization.
- **Checkboxes/Radios:** Soft-rounded squares and circles that fill with Electric Blue when selected, providing a clear, tactile response.