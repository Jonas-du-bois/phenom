# Phenom Search - Complete React & Styling Documentation

## Overview

**Phenom Search** is a comprehensive UFO/UAP observation database frontend application built with React, TypeScript, and Tailwind CSS. The application provides a modern, dark-themed interface for exploring historical UFO observations with scientific rigor.

**Source Folder:** `docs/PhenomSearch-react-code/Phenom Search Prototype/`

---

## 📁 Project Structure

```
Phenom Search Prototype/
├── src/
│   ├── App.tsx                    # Main application with routing
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Compiled Tailwind CSS
│   ├── assets/                    # Static assets
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ... (40+ UI components)
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HomePage.tsx
│   │   ├── Browse.tsx
│   │   ├── Timeline.tsx
│   │   ├── MapWithRealAPI.tsx
│   │   ├── Stats.tsx
│   │   ├── About.tsx
│   │   ├── CollectionsHub.tsx
│   │   ├── SightingsList.tsx
│   │   ├── ObservationDetail.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ProgressiveFilterPanel.tsx
│   │   ├── RadialSymbol.tsx
│   │   ├── CircularGauge.tsx
│   │   ├── StatsCard.tsx
│   │   ├── LoadingState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── GlobalLoader.tsx
│   │   └── collectionsData.ts
│   ├── contexts/
│   │   └── APIContext.tsx         # Global data context
│   ├── hooks/
│   │   ├── useAPICache.ts
│   │   └── useFilteredSightings.ts
│   └── styles/
│       └── globals.css            # Tailwind configuration
```

---

## 🎨 Design System

### Primary Color Palette

| Color Name | Hex Code | CSS Variable/Class | Usage |
|------------|----------|-------------------|-------|
| **Cyan (Primary)** | `#00F0FF` | `text-[#00F0FF]`, `bg-[#00F0FF]` | Accent, CTAs, highlights, links |
| **Dark Blue** | `#0066CC` | `via-[#0066CC]` | Gradients |
| **Navy** | `#002288` | `to-[#002288]` | Gradient endpoints |
| **Background Primary** | `#000000` | `bg-[#000000]` | Main pages |
| **Background Secondary** | `#080A0E` | `bg-[#080A0E]` | Browse, Stats pages |
| **Card Background** | `#12151C` | `bg-[#12151C]` | Cards, panels |

### Opacity Variants

| Base Color | Opacity | Class | Usage |
|------------|---------|-------|-------|
| White | 5% | `bg-white/5` | Subtle card backgrounds |
| White | 10% | `bg-white/10`, `border-white/10` | Borders, dividers |
| White | 20% | `border-white/20` | Hover borders |
| White | 30-40% | `text-white/40` | Secondary text |
| White | 50-60% | `text-white/60` | Muted text |
| White | 70-80% | `text-white/80` | Near-primary text |
| Cyan | 5-50% | `bg-[#00F0FF]/10` | Hover states, highlights |

### Typography

**Font Family:**
- Primary: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Monospace: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`

**Text Sizes:**

| Element | Size | Weight | Tracking | Line Height |
|---------|------|--------|----------|-------------|
| Hero H1 | `8.5rem` | 400 | `-0.02em` | 0.95 |
| Page H1 | `4rem` / `3.5rem` | 400 | `-0.02em` | - |
| Section H2 | `2.5rem` / `1.5rem` | 400 | `0.05em` | - |
| Card Title | `1.25rem` / `1.125rem` | - | `0.05em` | - |
| Body | `1rem` / `0.95rem` | - | - | 1.7 |
| Labels | `0.875rem` | - | `0.1em` | - |
| Micro | `0.75rem` / `0.65rem` | - | `0.15em` | - |

**Text Transforms:**
- Navigation: `uppercase tracking-wider`
- Labels: `uppercase tracking-wider`
- Page titles: `lowercase tracking-tight`

---

## 🧩 Core Components

### 1. Header (`Header.tsx`)

**Purpose:** Fixed navigation bar at the top of all pages

```tsx
<header className="w-full px-20 py-6 fixed top-0 left-0 right-0 bg-[#000000] z-50 border-b border-white/10">
```

**Props:**
- `showBack?: boolean` - Show back button
- `backTo?: string` - Back navigation path
- `backLabel?: string` - Back button label

**Navigation Links:**
- Collections, Browse, Timeline, Map, Stats, About, Help

---

### 2. Footer (`Footer.tsx`)

**Purpose:** Site footer with navigation, API info, and branding

```tsx
<footer className="bg-[#000000] border-t border-white/10 text-white mt-32">
```

---

### 3. RadialSymbol (`RadialSymbol.tsx`)

**Purpose:** Decorative radial/sunburst SVG icon used throughout

```tsx
<RadialSymbol size={200} className="text-[#00F0FF] opacity-20" rays={24} />
```

**Props:**
- `size?: number` - SVG size (default: 200)
- `className?: string` - Additional classes
- `rays?: number` - Number of rays (default: 24)

---

### 4. LoadingState (`LoadingState.tsx`)

**Purpose:** Full-screen loading indicator

```tsx
<LoadingState 
  message="Loading observations..." 
  showProgress={true}
  current={50}
  total={100}
/>
```

---

### 5. EmptyState (`EmptyState.tsx`)

**Purpose:** Display when no results found

```tsx
<EmptyState 
  title="No Results Found"
  message="No observations match your criteria."
  onClearFilters={() => {}}
  showClearFilters={true}
/>
```

---

### 6. ErrorState (`ErrorState.tsx`)

**Purpose:** Display API/connection errors

```tsx
<ErrorState 
  title="Connection Error"
  message="Unable to load data"
  onRetry={() => refetch()}
/>
```

---

### 7. StatsCard (`StatsCard.tsx`)

**Purpose:** Display a single statistic with icon

```tsx
<StatsCard 
  value={18000}
  label="Total Observations"
  icon={Database}
  color="cyan"
/>
```

**Props:**
- `value: string | number`
- `label: string`
- `icon?: LucideIcon`
- `color?: 'cyan' | 'white' | 'green' | 'red'`

---

### 8. CircularGauge (`CircularGauge.tsx`)

**Purpose:** Circular progress gauge using Recharts

```tsx
<CircularGauge 
  value={12} 
  max={15} 
  label="Credibility"
/>
```

---

## 📄 Page Components

### HomePage (`HomePage.tsx`)

- Hero section with animated stats
- Featured collections grid
- Radial symbol decorations

### Browse (`Browse.tsx`)

- Search bar with glassmorphic effect
- Progressive filter panel (sliding)
- Results table with pagination
- Export functionality

### Timeline (`Timeline.tsx`)

- Vertical timeline with period markers
- Color-coded eras (1947-2024)
- Grid of top observations per period

### MapWithRealAPI (`MapWithRealAPI.tsx`)

- OpenStreetMap tiles
- Marker clustering
- Zoom/pan controls
- Detail panel for selected locations

### Stats (`Stats.tsx`)

- StatsCard grid
- Top countries bar chart
- Top shapes distribution

### CollectionsHub (`CollectionsHub.tsx`)

- Grid of curated collections
- Dynamic count calculation

### SightingsList (`SightingsList.tsx`)

- Paginated table view
- Collection-specific filtering

### ObservationDetail (`ObservationDetail.tsx`)

- Hero image header
- Circular gauges for metrics
- Similar observations grid

---

## 🎨 UI Patterns

### Glassmorphic Cards

```tsx
<div 
  className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg"
  style={{
    boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.1)',
  }}
>
```

### Hover Card Effect

```tsx
<div className="bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20">
```

### Primary Button

```tsx
<button className="bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors">
```

### Secondary Button

```tsx
<button className="px-6 py-3 border border-white/20 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider">
```

### Table Row

```tsx
<div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8 px-10 py-8 items-center border-b border-white/10 hover:bg-white/5">
```

---

## 🔄 State Management

### APIContext (`contexts/APIContext.tsx`)

Global context providing:
- `sightings: Sighting[]` - All observations
- `loading: boolean` - Loading state
- `loadingProgress: number` - Progress percentage
- `error: string | null` - Error message
- `statistics: Statistics | null` - API statistics
- `countries, locales, observerTypes, ufoShapes, phenomenaTypes` - Filter options
- `metadata: Metadata` - Structured filter metadata
- `refetch: () => void` - Refetch function

### Custom Hooks

**useAPICache:**
```tsx
const cache = useAPICache<ResponseType>();
cache.set(key, data, { expiresIn: 3 * 60 * 1000 });
const cached = cache.get(key);
```

---

## 📱 Responsive Patterns

The application uses Tailwind breakpoints:
- Mobile: `< 768px` (limited responsive implementation)
- Desktop: Primary target

Common patterns:
- `px-20` padding on desktop
- `max-w-[1400px] mx-auto` for content containers
- Grid columns: `grid-cols-3`, `grid-cols-4`

---

## 🎭 Animations

### Tailwind Animations
- `animate-spin` - Loading spinners
- `animate-pulse` - Pulsing effects
- `animate-ping` - Ping effects for notifications

### Framer Motion (motion/react)
```tsx
<motion.div
  initial={{ x: '-100%' }}
  animate={{ x: 0 }}
  exit={{ x: '-100%' }}
  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
>
```

### Transitions
- `transition-all duration-200` - General transitions
- `transition-colors` - Color transitions
- `transition-transform duration-500` - Transform effects

---

## 📦 Dependencies

- **React 18** with TypeScript
- **React Router DOM** - Routing
- **Tailwind CSS 4.1** - Styling
- **Radix UI** - Accessible primitives
- **Lucide React** - Icon library
- **Recharts** - Charts (CircularGauge)
- **Framer Motion** (motion/react) - Animations
- **Sonner** - Toast notifications

---

## 🌐 API Integration

**Base URL:** `https://phenomsearch-api.onrender.com/api/v1`

**Endpoints Used:**
- `/statistics` - Database stats
- `/sightings/paginated` - Paginated sightings
- `/sightings` - Search with filters
- `/filters/countries` - Country list
- `/filters/locales` - Location types
- `/filters/observer-types` - Observer categories
- `/filters/ufo-shapes` - UFO morphologies
- `/filters/phenomena` - Associated phenomena

---

*Documentation generated from source analysis of `docs/PhenomSearch-react-code/Phenom Search Prototype/`*
