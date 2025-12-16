# Phenom Search - Design System Reference

## Color Palette

### Primary Colors

#### Cyan (Accent Color)
- **Base:** `#00F0FF`
- **Hover:** `#00D0DF`
- **Classes:**
  - Text: `text-[#00F0FF]`
  - Background: `bg-[#00F0FF]`
  - Border: `border-[#00F0FF]`

```css
/* Cyan with opacity variants */
bg-[#00F0FF]/5    /* 5% - Subtle highlight */
bg-[#00F0FF]/10   /* 10% - Light background */
bg-[#00F0FF]/20   /* 20% - Button hover */
bg-[#00F0FF]/50   /* 50% - Medium emphasis */
bg-[#00F0FF]/80   /* 80% - Strong emphasis */
bg-[#00F0FF]/90   /* 90% - Hover state */

border-[#00F0FF]/30  /* 30% - Subtle border */
border-[#00F0FF]/50  /* 50% - Hover border */

text-[#00F0FF]/60    /* 60% - Muted accent text */
text-[#00F0FF]/70    /* 70% - Secondary accent text */
```

#### Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| Pure Black | `#000000` | HomePage, ObservationDetail, CollectionsHub |
| Dark Navy | `#080A0E` | Browse, Stats, Timeline, Map pages |
| Card Dark | `#12151C` | Cards, panels, modals |
| Card Darker | `#0a0e14` | Map container background |

#### Gradient Colors

```css
/* Timeline gradient */
from-[#00F0FF] via-[#0066CC] to-[#002288]

/* Fade to transparent */
from-[#000000] via-transparent to-transparent
bg-gradient-to-t
bg-gradient-to-b
bg-gradient-to-r
```

### Semantic Colors

| Type | Color | Class |
|------|-------|-------|
| Success | `green-500` | `text-green-500`, `bg-green-500` |
| Error | `red-500` | `text-red-500`, `bg-red-500/20`, `border-red-500/50` |

### White Opacity Scale

```css
/* Text opacity */
text-white          /* 100% - Primary text */
text-white/90       /* 90% - Near primary */
text-white/80       /* 80% - Emphasized secondary */
text-white/70       /* 70% - Secondary text */
text-white/60       /* 60% - Tertiary text */
text-white/50       /* 50% - Muted text */
text-white/40       /* 40% - Very muted */
text-white/30       /* 30% - Subtle */
text-white/20       /* 20% - Very subtle */
text-white/10       /* 10% - Minimal */

/* Background opacity */
bg-white/5          /* 5% - Card background */
bg-white/10         /* 10% - Hover background */

/* Border opacity */
border-white/5      /* 5% - Subtle border */
border-white/10     /* 10% - Standard border */
border-white/20     /* 20% - Emphasis border */
border-white/30     /* 30% - Strong border */
border-white/40     /* 40% - Hover border */
```

### Black Opacity Scale

```css
bg-black/30         /* 30% - Backdrop light */
bg-black/40         /* 40% - Backdrop medium */
bg-black/50         /* 50% - Modal backdrop */
bg-black/60         /* 60% - Strong backdrop */
bg-black/90         /* 90% - Near solid */
bg-black/95         /* 95% - Almost solid */
```

---

## Typography

### Font Families

```css
/* Primary font - Body and headings */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace - Technical data */
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
/* Class: font-mono */
```

### Font Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Text Size Scale

| Size | Value | Usage |
|------|-------|-------|
| Hero | `8.5rem` | Main hero title only |
| Display | `4rem` | Page titles |
| H1 | `3.5rem` | Section titles |
| H2 | `2.5rem` | Large section headers |
| H3 | `1.5rem` | Card section titles |
| H4 | `1.25rem` | Card titles |
| H5 | `1.125rem` | Emphasis text |
| Body | `1rem` | Default body text |
| Body Small | `0.95rem` | Secondary body |
| Label | `0.875rem` | Labels, buttons |
| Caption | `0.8rem` | Captions |
| Micro | `0.75rem` | Small labels |
| Nano | `0.7rem` | Very small text |
| Pico | `0.65rem` | Tiniest text |

### Font Weights

```css
font-weight: 300;   /* Light - gauge numbers */
font-weight: 400;   /* Normal - body, titles */
font-weight: 500;   /* Medium - labels */
font-weight: 600;   /* Semibold - emphasis */
font-weight: 700;   /* Bold - badges */
```

### Letter Spacing

```css
tracking-tight      /* -0.025em - Large titles */
/* Custom: -0.02em, -0.01em */

tracking-wider      /* 0.05em - Labels */
/* Custom: 0.05em, 0.1em, 0.15em */
```

### Line Heights

```css
line-height: 0.95;  /* Hero titles */
line-height: 1;     /* Large numbers */
line-height: 1.5;   /* Default */
line-height: 1.6;   /* Body text */
line-height: 1.7;   /* Paragraphs */
```

### Text Transforms

```css
uppercase          /* Navigation, labels, buttons */
lowercase          /* Page titles */
```

---

## Spacing System

### Tailwind Spacing Scale

```css
/* Base unit: 0.25rem (4px) */
spacing-1   = 4px     (0.25rem)
spacing-2   = 8px     (0.5rem)
spacing-3   = 12px    (0.75rem)
spacing-4   = 16px    (1rem)
spacing-5   = 20px    (1.25rem)
spacing-6   = 24px    (1.5rem)
spacing-8   = 32px    (2rem)
spacing-10  = 40px    (2.5rem)
spacing-12  = 48px    (3rem)
spacing-16  = 64px    (4rem)
spacing-20  = 80px    (5rem)
spacing-32  = 128px   (8rem)
```

### Common Spacing Patterns

```css
/* Page padding */
px-20 py-16        /* Standard page */
px-20 py-32        /* Hero section */
px-20 py-20        /* Content section */

/* Container max-width */
max-w-[1400px] mx-auto   /* Main container */
max-w-[1200px] mx-auto   /* Narrow container */
max-w-[900px]            /* Content block */

/* Card padding */
p-8                /* Standard card */
p-10               /* Large card */
p-12               /* Extra large card */
p-6                /* Compact card */

/* Section spacing */
mb-16              /* Between major sections */
mb-12              /* Between sections */
mb-8               /* Between blocks */
mb-6               /* Between elements */
mb-4               /* Between small elements */

/* Grid gaps */
gap-8              /* Large grid */
gap-6              /* Standard grid */
gap-4              /* Compact grid */
gap-2              /* Tight grid */
```

---

## Layout Patterns

### Page Container

```tsx
<div className="min-h-screen bg-[#000000] text-white">
  <Header />
  <div className="px-20 py-16 pt-32">
    <div className="max-w-[1400px] mx-auto">
      {/* Content */}
    </div>
  </div>
  <Footer />
</div>
```

### Grid Patterns

```css
/* 3 column grid */
grid grid-cols-3 gap-8

/* 4 column grid */
grid grid-cols-4 gap-8

/* Table grid */
grid grid-cols-[140px_1fr_140px_2fr] gap-8

/* 2 column asymmetric */
grid grid-cols-[1fr_2fr] gap-20
grid grid-cols-[2fr_1fr] gap-12
```

### Flexbox Patterns

```css
/* Header layout */
flex items-center justify-between

/* Centered content */
flex items-center justify-center

/* Column layout */
flex flex-col gap-4

/* Row with gap */
flex items-center gap-3
```

---

## Border & Radius

### Border Widths

```css
border            /* 1px */
border-2          /* 2px */
border-3          /* 3px */
border-t          /* Top only */
border-b          /* Bottom only */
border-l          /* Left only - accent borders */
border-l-2        /* Left accent 2px */
```

### Border Radius

```css
rounded           /* 0.25rem */
rounded-lg        /* var(--radius) = 0.625rem */
rounded-full      /* Fully rounded */
```

### Common Border Patterns

```css
/* Standard card border */
border border-white/10

/* Hover border */
hover:border-white/20

/* Accent border */
border-[#00F0FF]
border-[#00F0FF]/30

/* Left accent */
border-l-2 border-white
```

---

## Shadows & Effects

### Box Shadows

```css
shadow-lg         /* Medium shadow */
shadow-2xl        /* Large shadow */

/* Custom shadow */
style={{ boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.1)' }}
style={{ boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)' }}
style={{ boxShadow: '0 0 30px rgba(0, 240, 255, 1)' }}
```

### Backdrop Effects

```css
backdrop-blur-sm        /* 8px blur */
backdrop-blur-xl        /* 24px blur */
```

### Opacity

```css
opacity-0          /* Hidden */
opacity-5          /* Barely visible */
opacity-10         /* Very subtle */
opacity-20         /* Subtle */
opacity-30         /* Light */
opacity-40         /* Medium-light */
opacity-50         /* Medium */
opacity-60         /* Medium-strong */
```

---

## Z-Index Scale

```css
z-10              /* Above content */
z-20              /* Elevated */
z-40              /* High */
z-50              /* Modal/Header */
z-[60]            /* Above modal */
z-[70]            /* Top layer */
```

---

## CSS Variables

```css
:root {
  --font-size: 16px;
  --background: #fff;
  --foreground: oklch(.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(.95 .0058 264.53);
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --destructive: #d4183d;
  --border: #0000001a;
  --input-background: #f3f3f5;
  --radius: 0.625rem;
  --ring: oklch(.708 0 0);
  
  /* Chart colors */
  --chart-1: oklch(.646 .222 41.116);
  --chart-2: oklch(.6 .118 184.704);
  --chart-3: oklch(.398 .07 227.392);
  --chart-4: oklch(.828 .189 84.429);
  --chart-5: oklch(.769 .188 70.08);
}
```

---

## Custom Scrollbar

```css
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
```

---

*Design System extracted from Phenom Search prototype source code.*
