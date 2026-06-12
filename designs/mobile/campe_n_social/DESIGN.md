---
name: ElijoCreer High-Performance Sports
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#41474f'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717880'
  outline-variant: '#c1c7d0'
  surface-tint: '#236391'
  primary: '#004b75'
  on-primary: '#ffffff'
  primary-container: '#236391'
  on-primary-container: '#bbddff'
  inverse-primary: '#94ccff'
  secondary: '#39618c'
  on-secondary: '#ffffff'
  secondary-container: '#a5ccfd'
  on-secondary-container: '#2e5781'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c6a94e'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cde5ff'
  primary-fixed-dim: '#94ccff'
  on-primary-fixed: '#001d32'
  on-primary-fixed-variant: '#004a75'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#a2cafa'
  on-secondary-fixed: '#001d36'
  on-secondary-fixed-variant: '#1e4972'
  tertiary-fixed: '#ffe085'
  tertiary-fixed-dim: '#e3c466'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  success-accent: '#c7a32b'
  live-indicator: '#ba1a1a'
  glass-bg: rgba(247, 249, 251, 0.8)
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  card-gap: 12px
  gutter: 16px
  container-padding: 20px
  section-margin: 32px
---

## Brand & Style

ElijoCreer is a premium sports social platform that blends the excitement of live competition with the sophistication of a modern fintech app. The brand personality is **energetic, authoritative, and community-driven**. It targets sports enthusiasts who value data accuracy and social status within their peer groups.

The design style is **Corporate Modern with Glassmorphism accents**. It utilizes a clean, high-key interface with "fidelity" color mapping. Visual interest is generated through subtle backdrop blurs, organic abstract shapes in backgrounds, and micro-animations (like the "Live" pulse) that evoke a sense of real-time urgency without feeling cluttered.

## Colors

The palette is anchored by **Sky and Navy Blues**, symbolizing trust and the sporting spirit. 
- **Primary (#236391)**: Used for brand identity, active navigation states, and primary CTAs.
- **Secondary (#39618c)**: Used for secondary actions and grouping elements to provide depth without competing with the primary blue.
- **Tertiary (#735c00)**: A "Gold/Ochre" used exclusively for status indicators (Pending, Leader, Trending) and high-value rewards.
- **Neutral (#F8FAFC)**: A very cool, almost-white grey used for the main background to reduce eye strain and make card elements pop.

The system uses a "Fidelity" variant, meaning color roles are closely tied to their base hues rather than shifting towards neutrals.

## Typography

The system uses a pairing of **Montserrat** for headlines and **Hanken Grotesk** for functional text. 
- **Headlines**: Montserrat provides a geometric, bold, and urban feel. Use `display-lg` for hero numbers (rankings, scores) and `headline-lg` for section titles.
- **Body & Labels**: Hanken Grotesk offers a sharp, contemporary look that maintains legibility at small sizes. 
- **Utility**: `label-sm` is used for uppercase tracking-heavy subheaders to provide a professional, data-driven aesthetic. `caption` (10px) is reserved for supplementary metadata like "stable" or "trending" status.

## Layout & Spacing

The layout follows a **Fixed-Width Mobile-First** approach (max-width: 480px) centered on larger viewports. 
- **Grid**: Uses a flexible vertical stack with a standard `container-padding` of 20px on the horizontal axis.
- **Sectioning**: Sections are separated by a generous `section-margin` (32px) to allow the content to breathe.
- **Internal Spacing**: Cards utilize a `12px` gap for nested elements, while fine-grained labels use a `4px` base unit.
- **Horizontal Scrolling**: Group cards and carousels should use `overflow-x-auto` with a `pb-2` to clear custom scrollbars or visual shadows.

## Elevation & Depth

The system uses **Tonal Layers and Ambient Shadows** to define hierarchy:
- **Level 0 (Background)**: `#F8FAFC` flat surface.
- **Level 1 (Cards)**: White surfaces with a custom `card-shadow` (4px Y-offset, 12px blur, 8% opacity Primary color tint). This tinting makes the shadows feel more integrated into the brand.
- **Level 2 (Glass Layers)**: Navigation bars and info-badges use `backdrop-filter: blur(8px)` with semi-transparent white (80% opacity) to maintain context of the content beneath.
- **Interactive Depth**: Buttons and cards should use an `active:scale-95` transform to provide tactile feedback without requiring heavy 3D effects.

## Shapes

The shape language is **Rounded and Modern**:
- **Standard Cards**: `12px` (rounded-xl) for all main containers and match cards.
- **Small Components**: `8px` (rounded-lg) for secondary badges or internal card elements.
- **Pills/Circles**: `9999px` (rounded-full) for user avatars, status badges (e.g., "Live"), and the Floating Action Button.
- **Dashed Borders**: Used for "empty" or "action-required" states (like pending predictions) to differentiate from static content cards.

## Components

### Buttons
- **Primary**: Solid background (Secondary or Primary color), `rounded-lg`, `label-md` bold text. Includes an icon with a `18px` size.
- **FAB**: High-elevation (`shadow-xl`), `rounded-full`, Primary or Tertiary color, containing a `32px` centered icon.

### Cards
- **Bento Card**: High-contrast Primary background with abstract background blurs and white text for high-impact stats (e.g., Ranking).
- **Match Card**: White background, `card-shadow`, internal `border-b` for the header, and centered team layouts using `1/3` width columns.
- **Group Card**: Fixed-width (min-w 140px) with a 4px left-border accent using the status color (Primary, Secondary, or Tertiary).

### Navigation
- **Top Bar**: `h-16`, sticky, with a subtle `shadow-sm`.
- **Bottom Bar**: `rounded-t-xl`, glassmorphic backdrop, with centered icons that scale to `110%` and fill when active.

### Indicators
- **Status Badges**: Small, high-contrast labels (e.g., "Live", "Pendiente") with 2px padding and `10px` bold uppercase text.
- **Pulse**: Live indicators must use a CSS keyframe animation `pulse 2s infinite` with a fill-variation setting for the icon.