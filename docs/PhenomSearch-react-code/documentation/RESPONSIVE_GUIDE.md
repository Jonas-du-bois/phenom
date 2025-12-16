# Phenom Search - Responsive Guide

Documentation of responsive patterns and breakpoint handling.

---

## 📱 Current Implementation

The Phenom Search prototype is primarily designed for **desktop-first** viewing. The current implementation has limited mobile responsiveness, focusing on large screen experiences.

---

## 🖥️ Desktop Layout (Primary Target)

### Standard Page Measurements

| Element | Desktop Value |
|---------|---------------|
| Horizontal Padding | `px-20` (80px) |
| Max Content Width | `max-w-[1400px]` |
| Grid Columns | 3-4 columns |
| Card Width | ~400px in 3-col grid |
| Header Height | ~73px |
| Content Top Padding | `pt-32` (128px) |

### Desktop Grid Patterns

```tsx
// 4 column stats grid
<div className="grid grid-cols-4 gap-8">

// 3 column card grid  
<div className="grid grid-cols-3 gap-8">

// 2 column asymmetric layout
<div className="grid grid-cols-[1fr_2fr] gap-20">
<div className="grid grid-cols-[2fr_1fr] gap-12">

// Data table grid
<div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8">
```

---

## 📐 Breakpoint Strategy

For future responsive implementation, recommended breakpoints:

| Breakpoint | Width | Use Case |
|------------|-------|----------|
| `sm` | 640px+ | Small tablets |
| `md` | 768px+ | Tablets |
| `lg` | 1024px+ | Small laptops |
| `xl` | 1280px+ | Standard desktop |
| `2xl` | 1536px+ | Large screens |

---

## 🔄 Recommended Responsive Adaptations

### Navigation Header

**Current (Desktop):**
```tsx
<header className="w-full px-20 py-6 fixed top-0 left-0 right-0">
  <nav className="flex gap-10">
    {/* All nav links visible */}
  </nav>
</header>
```

**Recommended (Mobile):**
```tsx
<header className="w-full px-4 md:px-20 py-4 md:py-6 fixed top-0 left-0 right-0">
  {/* Mobile: Hamburger menu */}
  <button className="md:hidden" onClick={() => setMenuOpen(true)}>
    <Menu size={24} />
  </button>
  
  {/* Desktop: Nav links */}
  <nav className="hidden md:flex gap-10">
    {/* Nav links */}
  </nav>
</header>
```

### Page Content

**Current:**
```tsx
<div className="px-20 py-16 pt-32">
```

**Recommended:**
```tsx
<div className="px-4 md:px-8 lg:px-20 py-8 md:py-16 pt-20 md:pt-32">
```

### Grid Layouts

**Current:**
```tsx
<div className="grid grid-cols-3 gap-8">
```

**Recommended:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
```

### Stats Grid

**Current:**
```tsx
<div className="grid grid-cols-4 gap-8">
```

**Recommended:**
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
```

### Data Table

**Current:**
```tsx
<div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8">
```

**Recommended:**
```tsx
{/* Desktop: Table view */}
<div className="hidden lg:grid grid-cols-[140px_1fr_140px_2fr] gap-8">

{/* Mobile: Card view */}
<div className="lg:hidden space-y-4">
  {items.map(item => (
    <div className="bg-white/5 p-4 border border-white/10">
      {/* Stacked content */}
    </div>
  ))}
</div>
```

### Two-Column Layout

**Current:**
```tsx
<div className="grid grid-cols-[2fr_1fr] gap-12">
```

**Recommended:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-12">
```

### Hero Section

**Current:**
```tsx
<h1 style={{ fontSize: '8.5rem', lineHeight: '0.95' }}>
  Phenom<br />Search
</h1>
```

**Recommended:**
```tsx
<h1 className="text-4xl md:text-6xl lg:text-8xl" style={{ lineHeight: '0.95' }}>
  Phenom<br />Search
</h1>

/* Or with custom sizes */
<h1 
  className="text-[2.5rem] md:text-[5rem] lg:text-[8.5rem]" 
  style={{ lineHeight: '0.95' }}
>
```

---

## 📱 Mobile-Specific Components

### Mobile Menu (Recommended)

```tsx
const MobileMenu = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50"
          onClick={onClose}
        />
        <motion.nav
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-[#080A0E] z-50 p-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4">
            <X size={24} />
          </button>
          <div className="flex flex-col gap-6 mt-12">
            <Link to="/" className="text-white uppercase tracking-wider">Home</Link>
            <Link to="/browse" className="text-white uppercase tracking-wider">Browse</Link>
            {/* ... more links */}
          </div>
        </motion.nav>
      </>
    )}
  </AnimatePresence>
);
```

### Mobile Filter Panel

Instead of side panel, use bottom sheet:

```tsx
const MobileFilterSheet = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="fixed bottom-0 left-0 right-0 bg-[#080A0E] z-50 rounded-t-xl max-h-[80vh] overflow-y-auto"
      >
        <div className="p-4 border-b border-white/10">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3>Filters</h3>
            <button onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        {/* Filter content */}
      </motion.div>
    )}
  </AnimatePresence>
);
```

---

## 🖼️ Image Responsive Patterns

### Responsive Image Heights

```tsx
<div className="h-[150px] md:h-[200px] lg:h-[300px] overflow-hidden">
  <ImageWithFallback src={src} className="w-full h-full object-cover" />
</div>
```

### Aspect Ratio Containers

```tsx
<div className="aspect-video lg:aspect-[21/9]">
  <img className="w-full h-full object-cover" />
</div>
```

---

## 📏 Typography Responsive Patterns

### Responsive Text Sizes

```tsx
// Page title
<h1 className="text-2xl md:text-4xl lg:text-6xl tracking-tight lowercase">
  Page Title
</h1>

// Section title  
<h2 className="text-xl md:text-2xl lg:text-3xl tracking-tight">
  Section Title
</h2>

// Body text
<p className="text-sm md:text-base lg:text-lg">
  Body content
</p>
```

### With Custom Sizes (inline styles to classes)

```tsx
// Convert inline fontSize to responsive classes
// Before:
style={{ fontSize: '4rem' }}

// After:
className="text-[2rem] md:text-[3rem] lg:text-[4rem]"
```

---

## 🎯 Touch Target Guidelines

For mobile, ensure touch targets are at least 44x44px:

```tsx
// Instead of:
<button className="p-2">

// Use:
<button className="p-2 min-h-[44px] min-w-[44px]">

// Or on mobile only:
<button className="p-2 md:p-2 min-h-[44px] md:min-h-0">
```

---

## 📐 Map Responsive Pattern

```tsx
// Current
<div className="grid grid-cols-[2fr_1fr] gap-12">
  <div className="h-[700px]"> {/* Map */} </div>
  <div> {/* Detail panel */} </div>
</div>

// Recommended
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-12">
  <div className="h-[400px] lg:h-[700px]"> {/* Map */} </div>
  <div className="fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto bg-[#080A0E]">
    {/* Mobile: Bottom drawer, Desktop: Side panel */}
  </div>
</div>
```

---

## 🔧 CSS Media Query Reference

For custom media queries in CSS:

```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }

/* Touch/pointer detection */
@media (hover: none) { /* Touch devices */ }
@media (hover: hover) { /* Mouse devices */ }

/* Orientation */
@media (orientation: portrait) { }
@media (orientation: landscape) { }
```

---

## ⚠️ Current Limitations

The current implementation has these responsive limitations:

1. **Fixed horizontal padding** (`px-20`) doesn't adapt
2. **Fixed grid columns** don't collapse on smaller screens
3. **Large font sizes** via inline styles don't scale
4. **Navigation** doesn't have mobile menu
5. **Filter panel** uses fixed width sidebar
6. **Data tables** don't adapt to card layouts
7. **Map layout** is desktop-only optimized

---

## ✅ Implementation Checklist

To make the app fully responsive:

- [ ] Add mobile navigation menu component
- [ ] Convert `px-20` to responsive `px-4 md:px-8 lg:px-20`
- [ ] Convert inline font sizes to responsive classes
- [ ] Add column breakpoints to all grids
- [ ] Create mobile card view for data tables
- [ ] Implement mobile filter bottom sheet
- [ ] Adjust map layout for mobile
- [ ] Increase touch target sizes
- [ ] Test on actual mobile devices

---

*Responsive guide for Phenom Search prototype.*
