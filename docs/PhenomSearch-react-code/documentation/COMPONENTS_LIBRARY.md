# Phenom Search - Components Library

Complete catalog of all React components with their code and usage.

---

## 🏠 Layout Components

### Header

**File:** `src/components/Header.tsx`

**Purpose:** Fixed navigation bar

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showBack | boolean | false | Show back button |
| backTo | string | undefined | Navigation path |
| backLabel | string | "Back" | Button label |

**Full Code:**

```tsx
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database } from 'lucide-react';
import { useAPI } from '../contexts/APIContext';
import PhenomLogo from './PhenomLogo';

interface HeaderProps {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function Header({ showBack = false, backTo, backLabel = 'Back' }: HeaderProps) {
  const navigate = useNavigate();
  const { sightings, loading } = useAPI();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="w-full px-20 py-6 fixed top-0 left-0 right-0 bg-[#000000] z-50 border-b border-white/10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <PhenomLogo size="small" />
          </Link>
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase tracking-wider"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              <ArrowLeft size={16} />
              <span>{backLabel}</span>
            </button>
          )}
        </div>
        <nav className="flex gap-10">
          <Link 
            to="/collections" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Collections
          </Link>
          {/* Additional nav links... */}
        </nav>
      </div>
    </header>
  );
}
```

**Styles:**
- Fixed position: `fixed top-0 left-0 right-0`
- Background: `bg-[#000000]`
- Border: `border-b border-white/10`
- Z-index: `z-50`
- Horizontal padding: `px-20`
- Vertical padding: `py-6`

---

### Footer

**File:** `src/components/Footer.tsx`

**Purpose:** Site footer with navigation and branding

**Full Code:**

```tsx
import { Link } from 'react-router-dom';
import { Database, Github, Mail } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

export default function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-white/10 text-white mt-32">
      <div className="px-20 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <RadialSymbol size={40} className="text-[#00F0FF]" rays={12} />
                <h3 className="tracking-tight uppercase" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                  Phenom Search
                </h3>
              </div>
              <p className="text-white/40 mb-4" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                A comprehensive database for exploring historical UFO observations.
              </p>
            </div>
            {/* Navigation columns */}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 🎨 Decorative Components

### RadialSymbol

**File:** `src/components/RadialSymbol.tsx`

**Purpose:** Decorative sunburst/radial SVG icon

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | number | 200 | SVG size in pixels |
| className | string | "" | CSS classes |
| rays | number | 24 | Number of rays |

**Full Code:**

```tsx
interface RadialSymbolProps {
  size?: number;
  className?: string;
  rays?: number;
}

export default function RadialSymbol({ size = 200, className = '', rays = 24 }: RadialSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(100, 100)">
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i * 360) / rays;
          const radians = (angle * Math.PI) / 180;
          const innerRadius = 30;
          const outerRadius = 90;
          const x1 = Math.cos(radians) * innerRadius;
          const y1 = Math.sin(radians) * innerRadius;
          const x2 = Math.cos(radians) * outerRadius;
          const y2 = Math.sin(radians) * outerRadius;
          
          return (
            <line
              key={i}
              x1={x1} y1={y1}
              x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}
```

**Usage Examples:**

```tsx
// Decorative background
<RadialSymbol size={400} className="text-[#00F0FF] opacity-10" />

// Page accent
<RadialSymbol size={120} className="text-white opacity-10" rays={20} />

// Small icon
<RadialSymbol size={40} className="text-[#00F0FF]" rays={12} />
```

---

## 🔄 State Components

### LoadingState

**File:** `src/components/LoadingState.tsx`

**Purpose:** Full-screen loading indicator with optional progress

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | string | "Loading observations..." | Loading message |
| showProgress | boolean | false | Show progress bar |
| current | number | 0 | Current progress |
| total | number | 0 | Total items |

**Full Code:**

```tsx
import { Loader } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
  current?: number;
  total?: number;
}

export default function LoadingState({ 
  message = 'Loading observations...', 
  showProgress = false,
  current = 0,
  total = 0
}: LoadingStateProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080A0E] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 opacity-10">
        <RadialSymbol size={400} className="text-[#00F0FF]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-[#00F0FF] animate-spin" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border border-[#00F0FF]/30 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-white/90 mb-2" style={{ fontSize: '1.125rem' }}>
            {message}
          </p>
          {showProgress && total > 0 && (
            <p className="text-[#00F0FF]/70 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
              {current.toLocaleString()} / {total.toLocaleString()} ({percentage}%)
            </p>
          )}
        </div>

        {showProgress && total > 0 && (
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### EmptyState

**File:** `src/components/EmptyState.tsx`

**Purpose:** Display when no results are found

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "No Results Found" | Title text |
| message | string | - | Main message |
| suggestion | string | - | Suggestion text |
| onClearFilters | () => void | - | Clear filter callback |
| showClearFilters | boolean | true | Show clear button |
| icon | 'search' \| 'filter' | 'search' | Icon type |

---

### ErrorState

**File:** `src/components/ErrorState.tsx`

**Purpose:** Display API/connection errors

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | "Connection Error" | Error title |
| message | string | - | Error message |
| details | string | - | Additional details |
| onRetry | () => void | - | Retry callback |
| showRetry | boolean | true | Show retry button |

---

## 📊 Data Display Components

### StatsCard

**File:** `src/components/StatsCard.tsx`

**Purpose:** Display a single statistic with icon

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string \| number | - | Statistic value |
| label | string | - | Label text |
| icon | LucideIcon | - | Icon component |
| trend | 'up' \| 'down' \| 'neutral' | - | Trend direction |
| trendValue | string | - | Trend percentage |
| color | 'cyan' \| 'white' \| 'green' \| 'red' | 'cyan' | Value color |

**Full Code:**

```tsx
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'white' | 'green' | 'red';
  className?: string;
}

export default function StatsCard({ 
  value, 
  label, 
  icon: Icon,
  trend,
  trendValue,
  color = 'cyan',
  className = ''
}: StatsCardProps) {
  const colorClasses = {
    cyan: 'text-[#00F0FF]',
    white: 'text-white',
    green: 'text-green-500',
    red: 'text-red-500'
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-8 ${className}`}>
      {Icon && (
        <div className="mb-4">
          <Icon className="w-8 h-8 text-white/20" strokeWidth={1.5} />
        </div>
      )}
      
      <div className="flex items-baseline gap-3 mb-2">
        <div className={`${colorClasses[color]}`} style={{ fontSize: '3rem', lineHeight: '1' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      
      <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  );
}
```

---

### CircularGauge

**File:** `src/components/CircularGauge.tsx`

**Purpose:** Circular progress gauge using Recharts

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| value | number | Current value |
| max | number | Maximum value |
| label | string | Label text |

**Full Code:**

```tsx
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
}

export default function CircularGauge({ value, max, label }: CircularGaugeProps) {
  const data = [
    { name: 'filled', value: value },
    { name: 'empty', value: max - value },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 min-w-[160px] min-h-[160px]">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#ffffff" />
              <Cell fill="#1a1a1a" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white" style={{ fontSize: '2rem', fontFamily: 'monospace' }}>
            {value}
          </div>
          <div className="text-white/40" style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
            / {max}
          </div>
        </div>
      </div>
      <div className="mt-4 text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
        {label}
      </div>
    </div>
  );
}
```

---

## 🖼️ Image Components

### ImageWithFallback

**File:** `src/components/figma/ImageWithFallback.tsx`

**Purpose:** Image with error fallback

**Full Code:**

```tsx
import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`} style={style}>
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />
  )
}
```

---

## 🌐 GlobalLoader

**File:** `src/components/GlobalLoader.tsx`

**Purpose:** Full-screen app loading overlay with statistics

**Key Features:**
- Progress bar animation
- Statistics display during load
- Error state handling
- Animated loading dots

---

*Component library extracted from Phenom Search prototype source code.*
