# Design Documentation - Polysia

This document outlines the design system and standards for the Polysia application, based on **shadcn/ui** standards with specific customizations.

## Core Design Principles

### 1. Style: Nova

- **Compact & Modern:** The Nova style is a variant of shadcn/ui that focuses on a more compact and modern aesthetic.
- **Spacing:** Reduced padding and margins for a denser, more professional-looking interface.
- **Components:** Optimized for developer tools and dashboard-like applications.

### 2. Typography

- **Primary Font (Sans-Serif):** **Manrope**
  - Modern, geometric sans-serif that provides a clean, technical look.
  - Used for body text, UI elements, and navigation.
- **Icon Library:** **Lucide React**
  - Consistent stroke weight and geometric shapes.

### 3. Color Palette: Zinc

- **Base Color:** `zinc` (Neutral, balanced gray).
- **Theme Color:** `zinc` (Consistent with the base color for a monochromatic, professional look).
- **Accents:** High contrast using black/white as the primary interactive color.

### 4. Layout & Shape

- **Corner Radius:** `large`
  - Defined as `--radius: 1.0rem` in CSS variables.
  - Gives the application a friendly yet modern feel.

## Implementation Details

### Shadcn Configuration (`components.json`)

```json
{
  "style": "nova",
  "tailwind": {
    "baseColor": "zinc",
    "css": "client/global.css",
    "cssVariables": true
  }
}
```

### Tailwind Configuration (`tailwind.config.ts`)

```typescript
{
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    }
  }
}
```

### CSS Variables (`client/global.css`)

- Imports Manrope from Google Fonts.
- Defines HSL variables for the Zinc palette.
- Sets `--radius: 1.0rem`.

## Component Usage

- Always prefer components from `@/components/ui`.
- Use `lucide-react` for all icons.
- Adhere to the `nova` style's compact layout by avoiding excessive padding in custom components.
