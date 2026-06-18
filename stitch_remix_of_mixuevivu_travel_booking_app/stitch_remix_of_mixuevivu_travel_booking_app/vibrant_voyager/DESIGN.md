---
name: Vibrant Voyager
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
  on-surface-variant: '#414755'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006c4b'
  on-secondary: '#ffffff'
  secondary-container: '#64f9bc'
  on-secondary-container: '#00714e'
  tertiary: '#894d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ac6300'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#68fcbf'
  secondary-fixed-dim: '#45dfa4'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb874'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
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
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The brand personality of the design system is approachable, reliable, and optimistic. It is designed for modern travelers who value both efficiency and the joy of discovery. The visual language balances professional utility with a breezy, "vacation-ready" atmosphere.

The chosen style is **Modern Corporate with a Friendly Softness**. It utilizes the clarity and structure of high-end SaaS products but softens the edges—literally and figuratively—through high-radius corners, generous whitespace, and a high-key color palette. This ensures the UI feels like a helpful travel companion rather than a rigid booking engine.

## Colors

The palette is anchored by a vibrant **Soft Blue**, chosen for its associations with clarity, sky, and trust. This is the primary driver for actions and brand recognition.

- **Primary (#007AFF):** Used for main CTAs, active states, and progress indicators.
- **Secondary (#34D399):** A refreshing mint green used for "success" states, price drops, or sustainable travel labels.
- **Tertiary (#FF9500):** A warm orange used sparingly for ratings, badges, and high-energy highlights (e.g., "Last Minute Deals").
- **Neutral:** A pure white background (#FFFFFF) is mandatory to maintain a "clean" feel. The neutral palette scales through cool grays to provide subtle contrast for containers and secondary text.

## Typography

This design system uses **Plus Jakarta Sans** across all levels. Its contemporary, geometric construction feels modern and professional, while its slightly rounded terminals and open apertures provide the "friendly" personality required for a travel application.

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter-spacing for a tight, editorial look.
- **Body:** Use Regular (400) weight for maximum readability.
- **Labels:** Use SemiBold (600) for interactive elements like buttons and navigation items to ensure they stand out from descriptive text.

## Layout & Spacing

The layout philosophy follows a **Fluid-Fixed hybrid model**. On mobile, content uses a 4-column grid with 20px side margins to ensure elements don't feel cramped. On desktop, the layout centers within a max-width container using a 12-column grid.

Spacing follows an 8px rhythmic scale. To achieve the "generous spacing" requested, vertical stacks between major sections should favor `stack-md` (24px) or `stack-lg` (48px). Use internal card padding of at least 16px to prevent content from feeling crowded against the rounded edges.

## Elevation & Depth

Depth is communicated through **Ambient Shadows** and **Tonal Layering**.

- **Level 0 (Floor):** Pure white background.
- **Level 1 (Cards):** Use a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to lift cards off the background.
- **Level 2 (Interactive/Floating):** For active bottom navigation or floating action buttons, use a slightly deeper shadow (0px 8px 30px rgba(0, 0, 0, 0.08)).

Avoid using heavy borders. Instead, use thin 1px strokes in a very light neutral (e.g., #F1F5F9) only when necessary to define boundaries on white-on-white layouts.

## Shapes

The design system leans heavily into **Rounded** geometry to evoke friendliness.

- **Standard Elements:** Buttons and input fields use a `rounded` (0.5rem / 8px) radius.
- **Content Containers:** Main tour cards, hotel cards, and modal sheets must use `rounded-lg` (1rem / 16px) or `rounded-xl` (1.5rem / 24px) to create the signature soft look.
- **Utility Elements:** Search bars and category chips should use a pill-shape (full radius) to distinguish them from content containers.

## Components

### Buttons
Primary buttons are high-contrast Soft Blue with white text. Secondary buttons use a light blue tint background with primary blue text. All buttons feature rounded corners (8px-12px).

### Category Chips
Chips are pill-shaped with a light gray or tinted background. When active, they transition to the Primary Blue background with white text.

### Tour Cards
Cards feature a 16px-24px corner radius. Images are top-aligned with a subtle gradient overlay for text legibility if needed. Ratings are displayed in the Tertiary (Orange) color with a small star icon. Prices are positioned at the bottom right in a bold `headline-md` size.

### Input Fields
Inputs use a light gray background (#F8FAFC) with a 12px corner radius. On focus, the border transitions to a 1.5px Primary Blue stroke.

### Fixed Bottom Navigation
The navigation bar is fixed to the bottom with a background blur effect (Backdrop Filter) or solid white. It uses a subtle top-border or soft top-shadow to separate it from the scrolling content. Icons are line-style for an airy feel, filling in or changing color when active.