# Phenom Search - UI/UX Patterns Guide

Documentation of reusable patterns and best practices.

---

## 🏗️ Page Structure Pattern

### Standard Page Layout

Every page follows this consistent structure:

```tsx
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';

export default function PageName() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-16">
            <h1 className="tracking-tight lowercase" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
              Page Title
            </h1>
            <RadialSymbol size={100} className="text-white opacity-10" rays={20} />
          </div>
          
          {/* Page Content */}
          {/* ... */}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
```

### Key Measurements

| Element | Value |
|---------|-------|
| Header height | ~73px |
| Page top padding (with header) | `pt-32` (128px) |
| Horizontal padding | `px-20` (80px) |
| Max content width | `1400px` |
| Section spacing | `mb-16` |

---

## 🔄 Loading States Pattern

### Full Page Loading

```tsx
if (loading) {
  return <LoadingState message="Loading observations..." />;
}
```

### Inline Loading

```tsx
{loading ? (
  <div className="py-20">
    <LoadingState message="Searching observations..." />
  </div>
) : (
  // Content
)}
```

### Progress Loading

```tsx
<LoadingState 
  message="Loading data..."
  showProgress={true}
  current={500}
  total={18000}
/>
```

---

## ❌ Error States Pattern

### Full Page Error

```tsx
if (error) {
  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      <ErrorState 
        message="Failed to load search results"
        onRetry={fetchSearchResults}
      />
      <Footer />
    </div>
  );
}
```

### Inline Error

```tsx
{error ? (
  <div className="bg-[#12151C] border border-red-500/50 p-8">
    <div className="flex items-center gap-4 mb-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <div>
        <h2 className="text-xl mb-2">Error</h2>
        <p className="text-white/60">{error}</p>
      </div>
    </div>
    <button
      onClick={() => refetch()}
      className="mt-6 px-6 py-3 bg-[#00F0FF] text-black uppercase tracking-wider"
    >
      Retry
    </button>
  </div>
) : (
  // Content
)}
```

---

## 📭 Empty States Pattern

### No Results

```tsx
{results.length === 0 && (
  <EmptyState 
    title="No Results Found"
    message="No observations match your current criteria."
    suggestion="Try adjusting your filters or search terms."
    onClearFilters={clearAllFilters}
    showClearFilters={hasActiveFilters}
  />
)}
```

---

## 🗃️ Data Listing Pattern

### Table View

```tsx
<div className="bg-white/5 border border-white/10 overflow-hidden">
  {/* Header */}
  <div className="grid grid-cols-[...] gap-8 px-10 py-5 border-b border-white/10">
    {columns.map(col => (
      <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
        {col.label}
      </div>
    ))}
  </div>

  {/* Rows */}
  {items.map(item => (
    <Link
      key={item.id}
      to={`/item/${item.id}`}
      className="block border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
    >
      <div className="grid grid-cols-[...] gap-8 px-10 py-8 items-center">
        {/* Cell content */}
      </div>
    </Link>
  ))}
</div>
```

### Card Grid View

```tsx
<div className="grid grid-cols-3 gap-8">
  {items.map(item => (
    <Link key={item.id} to={`/item/${item.id}`} className="group">
      <div className="bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20">
        {/* Image */}
        <div className="h-[240px] overflow-hidden bg-black">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {/* Content */}
        <div className="p-8">
          <h3 className="tracking-tight uppercase" style={{ fontSize: '1.125rem' }}>
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  ))}
</div>
```

---

## 📄 Pagination Pattern

```tsx
{totalItems > itemsPerPage && (
  <div className="mt-12 flex items-center justify-between">
    {/* Info */}
    <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
      Showing {start} - {end} of {totalItems.toLocaleString()} results
    </div>
    
    {/* Controls */}
    <div className="flex gap-2">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <div className="px-6 py-3 bg-[#00F0FF] text-black uppercase tracking-wider">
        Page {page} of {totalPages}
      </div>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page >= totalPages}
        className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}
```

---

## 🔍 Filter Panel Pattern

### Sliding Panel (Left)

```tsx
<AnimatePresence>
  {showFilters && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={() => setShowFilters(false)}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 bottom-0 w-[480px] bg-[#080A0E] z-50 overflow-y-auto"
        style={{ boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Filter content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Filter Toggle Button

```tsx
<button
  onClick={() => setShowFilters(!showFilters)}
  className={`flex items-center gap-3 px-6 py-3 border transition-all ${
    showFilters 
      ? 'bg-[#00F0FF] border-[#00F0FF] text-black' 
      : 'border-white/20 text-white/70 hover:border-[#00F0FF]'
  }`}
>
  <SlidersHorizontal size={18} />
  <span className="uppercase tracking-wider">Filtres</span>
  {activeCount > 0 && (
    <span className={`${showFilters ? 'bg-black/30 text-white' : 'bg-[#00F0FF]/20 text-[#00F0FF]'} px-2 py-0.5 rounded-full text-xs`}>
      {activeCount}
    </span>
  )}
</button>
```

---

## 🗺️ Map Interaction Pattern

### Pan & Zoom

```tsx
const [zoom, setZoom] = useState(2);
const [center, setCenter] = useState({ lat: 20, lon: 0 });
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0, centerLat: 0, centerLon: 0 });

const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setDragStart({
    x: e.clientX,
    y: e.clientY,
    centerLat: center.lat,
    centerLon: center.lon
  });
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  // Calculate new center based on drag
  setCenter({ lat: newLat, lon: newLon });
};

const handleWheel = (e: React.WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) setZoom(z => Math.min(10, z + 1));
  else setZoom(z => Math.max(1, z - 1));
};
```

### Map Controls

```tsx
<div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
  <button onClick={handleZoomIn} className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black">
    <ZoomIn size={20} />
  </button>
  <button onClick={handleZoomOut} className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black">
    <ZoomOut size={20} />
  </button>
  <button onClick={handleReset} className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black">
    <RotateCcw size={20} />
  </button>
</div>
```

---

## 📊 Statistics Display Pattern

### Stats Grid

```tsx
<div className="grid grid-cols-4 gap-8">
  <StatsCard value={18000} label="Total Observations" icon={Database} color="cyan" />
  <StatsCard value={42} label="Countries" icon={Globe} color="white" />
  <StatsCard value={5000} label="Locations" icon={MapPin} color="white" />
  <StatsCard value="1947 - 2024" label="Date Range" icon={Calendar} color="white" />
</div>
```

### Bar Chart Distribution

```tsx
<div className="space-y-4">
  {items.sort((a, b) => b.count - a.count).slice(0, 10).map((item, index) => (
    <div key={item.name} className="flex items-center gap-4">
      <div className="w-8 text-white/30 text-right">{index + 1}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/90">{item.name}</span>
          <span className="text-[#00F0FF]">{item.count.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]" 
            style={{ width: `${(item.count / items[0].count) * 100}%` }}
          />
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## 🧭 Navigation Pattern

### Back Navigation

```tsx
const { state } = useLocation();

// Determine back path
const getBackPath = (): string => {
  if (state?.from) return state.from;
  const params = new URLSearchParams(location.search);
  const from = params.get('from');
  if (from) return `/collections/${from}`;
  return '/browse';
};
```

### Link with State

```tsx
<Link
  to={`/observation/${id}`}
  state={{ from: '/browse' }}
>
```

### Link with Query Params

```tsx
<Link to={`/observation/${id}?from=${collectionId}`}>
```

---

## 📤 Export Pattern

```tsx
<ExportButton 
  data={results} 
  filename={`phenom-search-${searchTerm || 'export'}`}
  label="Export Results"
/>
```

---

## ⌨️ Keyboard Shortcuts Pattern

Not explicitly implemented, but could follow this pattern:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowFilters(false);
    if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 🔐 Form Validation Pattern

Basic inline validation approach:

```tsx
<input
  type="text"
  aria-invalid={hasError}
  className="aria-invalid:ring-destructive/20 aria-invalid:border-destructive"
/>
```

---

## 💾 Data Caching Pattern

```tsx
const cache = useAPICache<ResponseType>();

// Check cache first
const cached = cache.get(cacheKey);
if (cached) {
  setData(cached);
  return;
}

// Fetch and cache
const response = await fetch(url);
const data = await response.json();
cache.set(cacheKey, data, { expiresIn: 3 * 60 * 1000 }); // 3 minutes
```

---

## 🎨 Theming Pattern

The app uses a dark theme throughout with consistent color tokens:

```tsx
// Color tokens
const colors = {
  primary: '#00F0FF',
  bgPrimary: '#000000',
  bgSecondary: '#080A0E',
  bgCard: '#12151C',
  textPrimary: 'white',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.1)',
};
```

---

*Patterns guide extracted from Phenom Search prototype.*
