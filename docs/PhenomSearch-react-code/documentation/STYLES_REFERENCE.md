# Phenom Search - Styles Reference

Complete reference of all CSS/Tailwind classes used in the application.

---

## 📐 Layout Classes

### Container Patterns

```css
/* Main page container */
min-h-screen bg-[#000000] text-white

/* Content wrapper */
px-20 py-16 pt-32
max-w-[1400px] mx-auto

/* Narrow wrapper */
max-w-[1200px] mx-auto
max-w-[900px]
max-w-[800px] mx-auto
max-w-[500px]
max-w-md mx-auto
```

### Flexbox

```css
/* Row layouts */
flex items-center justify-between
flex items-center gap-3
flex items-center gap-4
flex items-center gap-8
flex items-baseline gap-3

/* Column layouts */
flex flex-col gap-4
flex flex-col gap-6
flex flex-col items-center

/* Alignment */
flex items-center justify-center
flex items-start justify-between

/* Flex properties */
flex-1
flex-shrink-0
```

### Grid

```css
/* Standard grids */
grid grid-cols-2 gap-8
grid grid-cols-3 gap-6
grid grid-cols-3 gap-8
grid grid-cols-4 gap-8

/* Custom column widths */
grid grid-cols-[140px_1fr_140px_2fr] gap-8
grid grid-cols-[1fr_2fr] gap-20
grid grid-cols-[2fr_1fr] gap-12
```

### Positioning

```css
/* Fixed header */
fixed top-0 left-0 right-0

/* Absolute positioning */
absolute top-0 right-0
absolute bottom-4 left-4
absolute inset-0
absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2

/* Relative parent */
relative

/* Z-index scale */
z-10  z-20  z-40  z-50  z-[60]  z-[70]
```

---

## 🎨 Background Classes

### Solid Colors

```css
bg-[#000000]     /* Pure black */
bg-[#080A0E]     /* Dark navy */
bg-[#12151C]     /* Card background */
bg-[#0a0e14]     /* Map background */
bg-black         /* Tailwind black */
```

### With Opacity

```css
bg-white/5       /* Subtle card bg */
bg-white/10      /* Hover card bg */
bg-black/30
bg-black/40
bg-black/50      /* Modal backdrop */
bg-black/60
bg-black/90
bg-black/95
```

### Accent Colors

```css
bg-[#00F0FF]           /* Primary cyan */
bg-[#00F0FF]/5         /* Light cyan bg */
bg-[#00F0FF]/10        /* Hover cyan bg */
bg-[#00F0FF]/20        /* Active cyan bg */
bg-green-500
bg-red-500
bg-red-500/20
```

### Gradients

```css
bg-gradient-to-t from-[#000000] via-transparent to-transparent
bg-gradient-to-b from-[#00F0FF] via-[#0066CC] to-[#002288]
bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]
```

---

## ✏️ Text Classes

### Colors

```css
text-white
text-white/90  text-white/80  text-white/70
text-white/60  text-white/50  text-white/40
text-white/30  text-white/20

text-black

text-[#00F0FF]
text-[#00F0FF]/60
text-[#00F0FF]/70

text-green-500
text-red-500
```

### Font Size

```css
/* Standard Tailwind */
text-xs    /* 0.75rem */
text-sm    /* 0.875rem */
text-base  /* 1rem */
text-lg    /* 1.125rem */
text-xl    /* 1.25rem */
text-2xl   /* 1.5rem */
text-4xl   /* 2.25rem */

/* Custom inline styles */
style={{ fontSize: '8.5rem' }}   /* Hero */
style={{ fontSize: '4rem' }}     /* Page title */
style={{ fontSize: '3.5rem' }}   /* Large title */
style={{ fontSize: '3rem' }}     /* Stats number */
style={{ fontSize: '2.5rem' }}   /* Section title */
style={{ fontSize: '2rem' }}     /* Gauge value */
style={{ fontSize: '1.75rem' }}  /* Card value */
style={{ fontSize: '1.5rem' }}   /* H3 */
style={{ fontSize: '1.25rem' }}  /* H4 */
style={{ fontSize: '1.125rem' }} /* Body large */
style={{ fontSize: '1.1rem' }}   /* Emphasis */
style={{ fontSize: '1rem' }}     /* Body */
style={{ fontSize: '0.95rem' }}  /* Body small */
style={{ fontSize: '0.9rem' }}   /* Caption large */
style={{ fontSize: '0.875rem' }} /* Label */
style={{ fontSize: '0.85rem' }}  /* Caption */
style={{ fontSize: '0.8rem' }}   /* Small */
style={{ fontSize: '0.75rem' }}  /* Micro */
style={{ fontSize: '0.7rem' }}   /* Nano */
style={{ fontSize: '0.65rem' }}  /* Pico */
style={{ fontSize: '0.6rem' }}   /* Tiny */
```

### Font Weight

```css
font-medium    /* 500 */
font-semibold  /* 600 */
font-bold      /* 700 */

/* Custom */
style={{ fontWeight: '300' }}
style={{ fontWeight: '400' }}
style={{ fontWeight: '500' }}
style={{ fontWeight: '600' }}
style={{ fontWeight: '700' }}
```

### Font Family

```css
font-mono

/* Custom */
style={{ fontFamily: 'monospace' }}
```

### Text Transform & Spacing

```css
uppercase
lowercase
truncate

/* Letter spacing */
tracking-tight    /* -0.025em */
tracking-wider    /* 0.05em */

/* Custom spacing */
style={{ letterSpacing: '-0.02em' }}
style={{ letterSpacing: '-0.01em' }}
style={{ letterSpacing: '0.05em' }}
style={{ letterSpacing: '0.1em' }}
style={{ letterSpacing: '0.15em' }}
```

### Line Height

```css
leading-none   /* 1 */
leading-tight  /* 1.25 */
leading-normal /* 1.5 */

/* Custom */
style={{ lineHeight: '0.95' }}
style={{ lineHeight: '1' }}
style={{ lineHeight: '1.5' }}
style={{ lineHeight: '1.6' }}
style={{ lineHeight: '1.7' }}
```

---

## 🔲 Border Classes

### Border Width

```css
border           /* 1px all sides */
border-2         /* 2px all sides */
border-3         /* 3px all sides */
border-t         /* Top only */
border-b         /* Bottom only */
border-l         /* Left only */
border-l-2       /* Left 2px */
```

### Border Color

```css
border-white/5
border-white/10    /* Standard */
border-white/20    /* Emphasis */
border-white/30
border-white/40

border-[#00F0FF]
border-[#00F0FF]/30
border-[#00F0FF]/50

border-red-500
border-red-500/30
border-red-500/50
```

### Border Radius

```css
rounded        /* 0.25rem */
rounded-md     /* 0.375rem */
rounded-lg     /* 0.625rem */
rounded-full   /* Full circle */
rounded-xs     /* Extra small */
```

---

## 📏 Spacing Classes

### Padding

```css
/* All sides */
p-1  p-2  p-3  p-4  p-5  p-6  p-8  p-10  p-12

/* Horizontal/Vertical */
px-2  px-3  px-4  px-6  px-8  px-10  px-12  px-20
py-2  py-3  py-4  py-5  py-6  py-8  py-16  py-20  py-32

/* Individual sides */
pt-6  pt-8  pt-16  pt-32  pt-40
pb-6  pb-8  pb-32
pl-4  pl-16
pr-2
```

### Margin

```css
/* All sides */
m-2  m-4

/* Individual */
mt-1  mt-2  mt-4  mt-6  mt-8  mt-12  mt-16  mt-32
mb-1  mb-2  mb-3  mb-4  mb-6  mb-8  mb-10  mb-12  mb-16  mb-20
ml-3  ml-6
mr-3

/* Auto */
mx-auto
```

### Gap

```css
gap-1  gap-2  gap-3  gap-4  gap-6  gap-8  gap-10  gap-12
```

---

## 🎭 Effects & Transitions

### Transitions

```css
transition-all
transition-colors
transition-transform duration-500
transition-all duration-200
```

### Transforms

```css
-translate-x-1/2
-translate-y-1/2
translate(-50%, -50%)
hover:translate-x-1
hover:scale-105
hover:scale-110
```

### Animations

```css
animate-spin
animate-pulse
animate-ping
```

### Shadows

```css
shadow-lg
shadow-2xl

/* Custom */
style={{ boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.1)' }}
style={{ boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)' }}
style={{ boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)' }}
style={{ boxShadow: '0 0 15px rgba(0, 240, 255, 0.7)' }}
style={{ boxShadow: '0 0 30px rgba(0, 240, 255, 1)' }}
```

### Backdrop

```css
backdrop-blur-sm
backdrop-blur-xl
```

### Opacity

```css
opacity-0   opacity-5   opacity-10  opacity-20
opacity-30  opacity-40  opacity-50  opacity-60
opacity-70  opacity-80  opacity-90  opacity-100
```

---

## 🖱️ Interactive States

### Hover

```css
hover:text-white
hover:text-[#00F0FF]
hover:text-[#00F0FF]/80
hover:text-[#00F0FF]/70

hover:bg-white/5
hover:bg-white/10
hover:bg-[#00F0FF]
hover:bg-[#00F0FF]/10
hover:bg-[#00F0FF]/90

hover:border-white/20
hover:border-white/30
hover:border-white/40
hover:border-[#00F0FF]
hover:border-[#00F0FF]/50

hover:underline
hover:scale-105
hover:scale-110
hover:translate-x-1
```

### Disabled

```css
disabled:opacity-30
disabled:opacity-50
disabled:cursor-not-allowed
disabled:pointer-events-none
```

### Focus

```css
focus:outline-none
focus:ring-2
focus:ring-offset-2
focus-visible:border-ring
focus-visible:ring-ring/50
focus-visible:ring-[3px]
```

### Group Hover

```css
group
group-hover:text-white
group-hover:scale-105
group-hover:translate-x-1
```

---

## 📐 Size Classes

### Width

```css
w-full
w-1.5  w-2  w-4  w-5  w-6  w-8  w-12  w-16  w-20
w-[120px]  w-[480px]  w-[520px]

min-w-0
min-w-[160px]
min-w-[20px]

max-w-md
max-w-xl
max-w-2xl
max-w-3xl
max-w-[1400px]
max-w-[1200px]
```

### Height

```css
h-full
h-1  h-1.5  h-2  h-5  h-7  h-9  h-10
h-[100px]  h-[140px]  h-[160px]  h-[240px]  h-[300px]
h-[400px]  h-[500px]  h-[700px]

min-h-screen
min-h-[160px]
```

### Size (both)

```css
size-4
size-9
```

---

## 🔧 Utility Classes

### Display

```css
block
inline-block
inline-flex
hidden
sr-only        /* Screen reader only */
```

### Overflow

```css
overflow-hidden
overflow-y-auto
```

### Object Fit

```css
object-cover
```

### Cursor

```css
cursor-pointer
cursor-grab
cursor-grabbing
```

### Pointer Events

```css
pointer-events-none
```

### Text Alignment

```css
text-left
text-center
text-right
```

### Whitespace

```css
whitespace-nowrap
```

### Line Clamp

```css
line-clamp-2
```

---

## 📦 Component-Specific Patterns

### Card Pattern

```css
bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20
```

### Button Pattern

```css
bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors
```

### Input Pattern

```css
w-full bg-transparent border-none pl-16 pr-8 py-5 text-white placeholder-white/40 focus:outline-none
```

### Table Row Pattern

```css
grid grid-cols-[140px_1fr_140px_2fr] gap-8 px-10 py-8 items-center border-b border-white/10 hover:bg-white/5
```

### Navigation Link Pattern

```css
text-white/60 hover:text-white transition-colors uppercase tracking-wider
```

---

*Styles reference extracted from Phenom Search prototype.*
