---
name: Champion's Spirit
colors:
  surface: '#041329'
  surface-dim: '#041329'
  surface-bright: '#2c3951'
  surface-container-lowest: '#010e24'
  surface-container-low: '#0d1c32'
  surface-container: '#112036'
  surface-container-high: '#1c2a41'
  surface-container-highest: '#27354c'
  on-surface: '#d6e3ff'
  on-surface-variant: '#bfc8cf'
  inverse-surface: '#d6e3ff'
  inverse-on-surface: '#233148'
  outline: '#899298'
  outline-variant: '#40484e'
  surface-tint: '#86cffa'
  primary: '#aadeff'
  on-primary: '#00344a'
  primary-container: '#7bc4ee'
  on-primary-container: '#00516f'
  inverse-primary: '#00658b'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fbd358'
  on-tertiary: '#3c2f00'
  tertiary-container: '#deb83f'
  on-tertiary-container: '#5d4900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#86cffa'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#041329'
  on-background: '#d6e3ff'
  surface-variant: '#27354c'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is built to capture the collective hope and premium energy of the World Cup. The brand personality is "The Sophisticated Fan"—passionate and energetic, but refined and analytical. It avoids the neon "gamer" aesthetic in favor of a modern, editorial sports style that feels like a premium broadcast experience.

The design style is **Corporate / Modern** with **Glassmorphism** accents. It utilizes deep navy foundations to provide a "stadium at night" depth, while using bright celeste and gold highlights to draw focus to critical actions and achievements. The interface should feel expansive, clean, and authoritative.

## Colors
The palette is rooted in a "Deep Navy" dark mode to allow the "Celeste" and "White" to pop with high contrast, ensuring readability in a high-density data environment.

- **Primary (Celeste):** Used for active states, primary branding, and progress indicators.
- **Secondary (White):** Reserved for high-priority typography and clean iconography.
- **Tertiary (Gold):** Used exclusively for "Champion" moments—rankings, trophies, gold-tier predictions, and primary CTA buttons.
- **Neutral (Deep Navy):** Provides the structural depth. Backgrounds use a darker tint, while cards and containers use a slightly lighter navy to create a layered hierarchy.

## Typography
The typography system balances "Sora," a geometric and technical sans-serif for headlines that feels modern and athletic, with "Hanken Grotesk" for highly legible body copy. 

For data-heavy elements like scoreboards and ranking numbers, "JetBrains Mono" is introduced to provide a technical, "data-center" feel that ensures numbers align perfectly in tables and prediction grids. All headlines use a tight letter-spacing to maintain a bold, impactful presence.

## Layout & Spacing
This design system uses a **Fixed Grid** for desktop to maintain a premium, editorial feel that doesn't overstretch data tables. The layout is centered on a 12-column grid with 24px gutters.

- **Desktop (1200px+):** 12 columns, 40px margins.
- **Tablet (768px-1199px):** 8 columns, 24px margins. Content reflows into single columns for match lists.
- **Mobile (Under 768px):** 4 columns, 16px margins.
Vertical rhythm is strictly maintained using 8px increments (Base 8 system), ensuring that prediction inputs and match cards feel balanced and professional.

## Elevation & Depth
Depth is conveyed through **Tonal Layering** and **Subtle Blurs**. 

- **Level 0 (Canvas):** The deepest navy (`#050B14`), non-interactive.
- **Level 1 (Cards):** Surface Navy (`#112240`) with a 1px border of `rgba(255,255,255,0.05)`.
- **Level 2 (Hover/Active):** When a match card is hovered, it gains a subtle Celeste outer glow (0px 4px 20px `rgba(123, 196, 238, 0.15)`).
- **Overlays:** Modals and dropdowns use a high-density backdrop blur (20px) to maintain context of the stadium-like background while focusing on the action.

## Shapes
The shape language is **Rounded**, using 0.5rem (8px) as the standard radius. This softens the technical nature of the data without becoming "bubbly" or childish. 

- **Cards/Inputs:** 8px (Standard)
- **Buttons:** 12px (Medium) for a more approachable touch target.
- **Score Badges:** Pill-shaped (Full round) to distinguish them from structural UI components.

## Components
- **Buttons:** Primary buttons are Gold (`#D4AF37`) with black text for maximum "Champion" feel. Secondary buttons are Ghost-style with White borders.
- **Prediction Inputs:** Large, centered typography for scores. Use a subtle inner-shadow to suggest a physical "well" where the user places their bet.
- **Leaderboard Tables:** Zebra-striping is avoided; instead, use 1px horizontal dividers in `rgba(255,255,255,0.05)`. Highlight the user's row with a Celeste left-border.
- **Match Cards:** Grouped by date. Each card features team flags (circular), the "Celeste" primary color for the active prediction state, and a small Gold star for "double point" or "joker" predictions.
- **Chips:** Small, uppercase labels using `label-md` font. Used for "Live," "Finished," or "Group A" status indicators.
- **Progress Bars:** Thin, Celeste-colored bars to show how many users have predicted a specific outcome (e.g., 70% Home Win).