---
name: Cognitive Flow
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#270048'
  on-tertiary-container: '#a956f8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built for a modern, AI-driven learning experience that prioritizes mental clarity and focus. The brand personality is "The Quiet Mentor"—intelligent, calm, and highly capable without being overwhelming. It targets lifelong learners and professionals who require a high-density information environment that feels breathable.

The visual style is **Minimalist High-Tech**. It combines the structural discipline of Swiss minimalism with the ethereal quality of modern technology. By leveraging expansive whitespace and a refined color palette, the UI directs the user's cognitive load toward the content while using subtle motion and depth to signal AI-assisted interactions. The emotional response should be one of "effortless mastery."

## Colors

This design system utilizes a "Deep Space" palette to minimize eye strain during long learning sessions.

- **Primary (Deep Indigo):** Used for the core background and structural surfaces. It provides a stable, non-distracting foundation.
- **Secondary (Electric Blue):** The functional accent. Used for primary actions, progress indicators, and standard interactive states.
- **Tertiary (Vivid Violet):** Reserved exclusively for "AI Intelligence" features. When the system is thinking, suggesting, or generating, this color glows to signify active computation.
- **Neutrals (Soft Grays):** Used for secondary text and borders to maintain a low-contrast, sophisticated hierarchy.

The color mode is locked to **Dark** to reinforce the high-tech, premium feel of an advanced learning environment.

## Typography

The typography system relies on a pairing of **Geist** for technical precision in headings and UI labels, and **Inter** for comfortable reading in body copy.

- **Headlines:** Use Geist with tighter letter spacing and bold weights to create a "technical" editorial feel. Mobile headlines scale down to ensure content density remains appropriate on small screens.
- **Body:** Inter is used for all instructional and long-form content. Line heights are generous (1.5x) to prevent the "overwhelming" feeling and improve reading speed.
- **Labels:** Use Geist in medium/semibold weights. Small labels for metadata or AI-tags should use slight letter spacing for maximum legibility at small sizes.

## Layout & Spacing

The layout follows a **Fluid-Fixed hybrid model**. Content resides within a maximum container width of 1280px to prevent excessive line lengths on ultra-wide monitors.

- **Rhythm:** A strict 8px grid governs all spacing.
- **Whitespace:** Layouts should prioritize large margins (64px on desktop) to isolate different learning modules.
- **Grid:** Use a 12-column grid for desktop. For education "cards" or "modules," prefer a 3-column span to allow for detailed content without clutter.
- **Mobile Adaption:** On mobile, margins shrink to 20px, and the 12-column grid collapses into a single-column stack. Hidden sidebars should be used for navigation to keep the learning canvas clear.

## Elevation & Depth

Hierarchy is established through **Glassmorphism and Tonal Layering**.

- **Base Layer:** The deepest Indigo (#0F172A).
- **Surface Layer:** One shade lighter Indigo with a subtle 1px border (#1E293B at 50% opacity).
- **Interactive Depth:** Components "floating" above the surface use a backdrop blur (12px to 20px) and a soft, diffused shadow (0px 10px 30px rgba(0,0,0,0.3)).
- **AI Elevation:** Features powered by AI utilize a "Violet Glow" effect—a soft, tertiary-colored outer shadow that suggests the element is "active" or "thinking."

## Shapes

The shape language is **Rounded**, striking a balance between approachable education and professional technology.

- **Standard Elements:** Buttons, inputs, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Content modules and main learning canvases use a 1.5rem (24px) radius to create a soft, framed effect.
- **Pills:** Search bars and AI status tags use full "pill" rounding to distinguish them from static content.

## Components

- **Buttons:** Primary buttons are solid Electric Blue. Secondary buttons use a "Ghost" style with a 1px border. AI-specific buttons use a subtle violet gradient.
- **Input Fields:** Fields are dark with a 1px soft gray border. Upon focus, the border transitions to Electric Blue with a subtle outer glow.
- **Cards:** The "Learning Module" card uses a glassmorphic background with a 12px blur. It has no heavy shadows unless hovered, at which point it lifts slightly.
- **AI Chips:** Small, pill-shaped tags used for "Suggested Topic" or "AI Hint." These should have a subtle pulse animation when they first appear.
- **Progress Bars:** Thin, 4px tall lines. Completed sections use Electric Blue; sections currently being analyzed by AI use a shimmering Violet gradient animation.
- **Lists:** Clean, borderless list items separated by 12px of vertical space. Icons are monolinear and 20px in size.