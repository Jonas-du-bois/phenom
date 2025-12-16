# Phenom Search - Quick Reference

Fast lookup guide for developers working with the Phenom Search design system.

---

## 🎨 Colors

### Primary
```
Cyan:       #00F0FF
Black:      #000000
Navy:       #080A0E
Card:       #12151C
```

### Common Classes
```css
/* Backgrounds */
bg-[#000000]      bg-[#080A0E]      bg-[#12151C]
bg-white/5        bg-white/10       bg-[#00F0FF]

/* Text */
text-white        text-white/60     text-white/40
text-[#00F0FF]    text-black

/* Borders */
border-white/10   border-white/20   border-[#00F0FF]
```

---

## 📐 Spacing

### Standard Values
```css
px-20           /* Page horizontal */
py-16           /* Page vertical */
pt-32           /* Below header */
max-w-[1400px]  /* Container */

p-8             /* Card padding */
p-10            /* Large card */
p-12            /* XL card */

gap-8           /* Grid gap */
mb-16           /* Section margin */
```

---

## ✏️ Typography

### Font Sizes
```css
/* Hero */      style={{ fontSize: '8.5rem' }}
/* H1 */        style={{ fontSize: '4rem' }}
/* H2 */        style={{ fontSize: '2.5rem' }}
/* H3 */        style={{ fontSize: '1.5rem' }}
/* Body */      style={{ fontSize: '1rem' }}
/* Label */     style={{ fontSize: '0.875rem' }}
/* Small */     style={{ fontSize: '0.75rem' }}
/* Micro */     style={{ fontSize: '0.65rem' }}
```

### Text Styles
```css
uppercase tracking-wider         /* Labels */
lowercase tracking-tight         /* Titles */
font-mono                        /* Data */
```

### Letter Spacing
```css
style={{ letterSpacing: '-0.02em' }}   /* Titles */
style={{ letterSpacing: '0.1em' }}     /* Labels */
style={{ letterSpacing: '0.15em' }}    /* Headers */
```

---

## 🔲 Borders

```css
border border-white/10              /* Standard */
border border-white/20              /* Emphasis */
border-b border-white/10            /* Divider */
border-l-2 border-white             /* Accent */
```

---

## 🔘 Buttons

### Primary (Cyan)
```tsx
<button className="bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors">
```

### Secondary (Outline)
```tsx
<button className="border border-white/20 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider px-6 py-3">
```

### Ghost
```tsx
<button className="text-white/50 hover:text-white transition-colors uppercase tracking-wider">
```

---

## 📦 Cards

### Basic
```tsx
<div className="bg-white/5 border border-white/10 p-8">
```

### Interactive
```tsx
<div className="bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20">
```

### With Accent
```tsx
<div className="bg-white/5 border-l-2 border-white p-12">
```

---

## 🔍 Search

```tsx
<div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg" style={{ boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.1)' }}>
  <input className="w-full bg-transparent border-none pl-16 pr-8 py-5 text-white placeholder-white/40 focus:outline-none" />
</div>
```

---

## ☑️ Checkbox

```tsx
<div className={`w-4 h-4 border ${checked ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20'} transition-colors`} />
```

---

## 📊 Table

### Header
```tsx
<div className="grid grid-cols-[...] gap-8 px-10 py-5 border-b border-white/10">
  <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
```

### Row
```tsx
<div className="grid grid-cols-[...] gap-8 px-10 py-8 border-b border-white/10 hover:bg-white/5">
```

---

## 🏷️ Badge

```tsx
<span className="px-4 py-2 bg-white/5 border border-white/20 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
```

---

## 📈 Progress Bar

```tsx
<div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]" style={{ width: `${percent}%` }} />
</div>
```

---

## 🎭 States

### Loading
```tsx
<Loader className="w-16 h-16 text-[#00F0FF] animate-spin" />
```

### Error
```tsx
<AlertCircle className="w-20 h-20 text-red-500/80" />
```

### Empty
```tsx
<Search className="w-16 h-16 text-white/20" />
```

---

## ⚡ Transitions

```css
transition-colors     /* Color changes */
transition-all        /* All properties */
transition-transform duration-500   /* Transforms */
hover:scale-105       /* Hover grow */
```

---

## 🎨 Decorative

### RadialSymbol
```tsx
<RadialSymbol size={120} className="text-white opacity-10" rays={20} />
```

---

## 🔗 Navigation

```tsx
<Link className="text-white/60 hover:text-white transition-colors uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
```

---

## 🗃️ Grid Layouts

```css
grid grid-cols-3 gap-8          /* Cards */
grid grid-cols-4 gap-8          /* Stats */
grid grid-cols-[1fr_2fr] gap-20 /* Two column */
```

---

## 📱 Responsive (Recommended)

```css
px-4 md:px-8 lg:px-20           /* Padding */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
text-2xl md:text-4xl lg:text-6xl
```

---

## 🌐 API

```javascript
const API_BASE_URL = 'https://phenomsearch-api.onrender.com/api/v1';

// Endpoints
/statistics
/sightings/paginated?page=1&perPage=500
/sightings?search=term&country=USA
/filters/countries
/filters/observer-types
/filters/ufo-shapes
/filters/phenomena
```

---

## 🔧 Hooks

### useAPI
```tsx
const { sightings, loading, error, statistics, metadata, refetch } = useAPI();
```

### useAPICache
```tsx
const cache = useAPICache<T>();
cache.get(key);
cache.set(key, data, { expiresIn: 180000 });
```

---

## 📦 Icons (Lucide)

Common icons used:
```tsx
ArrowLeft, Search, X, SlidersHorizontal
Database, Globe, MapPin, Calendar
Loader, AlertCircle, ZoomIn, ZoomOut
Star, Shield, Users, FileText
```

---

## 🎭 Framer Motion

```tsx
import { motion, AnimatePresence } from 'motion/react';

// Slide in
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ type: 'spring', damping: 30, stiffness: 300 }}

// Fade
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
```

---

*Quick Reference for Phenom Search development.*
