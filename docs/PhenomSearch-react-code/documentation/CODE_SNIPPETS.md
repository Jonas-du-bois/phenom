# Phenom Search - Code Snippets

Copy-paste ready code patterns and UI elements.

---

## 🎨 Buttons

### Primary Button (Cyan)

```tsx
<button 
  className="bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors font-medium"
  style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}
>
  Apply Filters
</button>
```

### Primary Button with Icon

```tsx
<button className="group inline-flex items-center gap-4 px-12 py-5 border border-[#00F0FF]/30 bg-[#00F0FF]/5 transition-all hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50">
  <span className="uppercase tracking-wider text-[#00F0FF]" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
    View All Collections
  </span>
  <svg 
    className="w-5 h-5 text-[#00F0FF] transition-transform group-hover:translate-x-1" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
</button>
```

### Secondary Button (Outline)

```tsx
<button className="flex items-center gap-3 px-6 py-3 border border-white/20 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider">
  <span style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>Filter</span>
</button>
```

### Ghost Button

```tsx
<button className="flex items-center gap-2 px-4 py-3 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-wider">
  <X size={16} />
  Reset
</button>
```

### Toggle Button (Active/Inactive)

```tsx
<button
  onClick={() => setShowFilters(!showFilters)}
  className={`flex items-center gap-3 px-6 py-3 border transition-all ${
    showFilters 
      ? 'bg-[#00F0FF] border-[#00F0FF] text-black' 
      : 'border-white/20 text-white/70 hover:border-[#00F0FF] hover:text-[#00F0FF]'
  }`}
>
  <SlidersHorizontal size={18} />
  <span className="uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
    Filtres
  </span>
</button>
```

### Pagination Button

```tsx
<button
  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
  disabled={currentPage === 1}
  className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
>
  Previous
</button>
```

### Active Page Indicator

```tsx
<div className="px-6 py-3 bg-[#00F0FF] text-black uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
  Page {currentPage} of {totalPages}
</div>
```

### Icon Button

```tsx
<button
  onClick={handleZoomIn}
  className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
>
  <ZoomIn size={20} />
</button>
```

---

## 📦 Cards

### Basic Card

```tsx
<div className="bg-white/5 border border-white/10 p-8">
  {/* Card content */}
</div>
```

### Interactive Card

```tsx
<Link
  to={`/observation/${id}`}
  className="group bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20"
>
  <div className="h-[160px] overflow-hidden bg-black">
    <ImageWithFallback
      src={imageUrl}
      alt={location}
      className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
    />
  </div>
  <div className="p-6">
    <h3 className="mb-2 tracking-tight uppercase" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
      {location}
    </h3>
    <p className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
      {date}
    </p>
  </div>
</Link>
```

### Collection Card

```tsx
<div className="bg-white/5 border border-white/10 overflow-hidden h-[500px] flex flex-col transition-all hover:bg-white/10 hover:border-white/20">
  <div className="h-[300px] w-full overflow-hidden bg-black relative">
    <ImageWithFallback
      src={imageUrl}
      alt={title}
      className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute top-6 right-6">
      <RadialSymbol size={60} className="text-white opacity-40" rays={16} />
    </div>
  </div>
  <div className="flex-1 flex flex-col justify-between p-10">
    <div>
      <h3 className="mb-3 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      <p className="text-white/50" style={{ lineHeight: '1.5', fontSize: '0.9rem' }}>
        {description}
      </p>
    </div>
    <div className="text-white/30 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
      {count} cases
    </div>
  </div>
</div>
```

### Stats Card

```tsx
<div className="bg-white/5 border border-white/10 p-8">
  <Icon className="w-8 h-8 text-white/20 mb-4" strokeWidth={1.5} />
  <div className="flex items-baseline gap-3 mb-2">
    <div className="text-[#00F0FF]" style={{ fontSize: '3rem', lineHeight: '1' }}>
      {value.toLocaleString()}
    </div>
  </div>
  <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
    {label}
  </div>
</div>
```

### Summary Box

```tsx
<div className="bg-white/5 border-l-2 border-white p-12">
  <h2 className="mb-5 tracking-tight uppercase" style={{ fontSize: '1.125rem', letterSpacing: '0.05em' }}>
    Brief Description
  </h2>
  <p className="text-white/70" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
    {description}
  </p>
</div>
```

---

## 🔍 Search & Filters

### Glassmorphic Search Bar

```tsx
<div 
  className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg overflow-hidden"
  style={{
    boxShadow: '0 8px 32px 0 rgba(0, 240, 255, 0.1)',
  }}
>
  <div className="p-8">
    <div className="relative">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00F0FF]/60" size={24} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by location, description, country..."
        className="w-full bg-transparent border-none pl-16 pr-8 py-5 text-white placeholder-white/40 focus:outline-none text-lg"
        style={{ fontSize: '1.125rem' }}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  </div>
</div>
```

### Custom Checkbox

```tsx
<label className="flex items-center space-x-2 cursor-pointer group">
  <div className="relative">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={() => toggle()}
      className="sr-only"
    />
    <div className={`w-4 h-4 border ${isChecked ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
    {isChecked && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-black" />
      </div>
    )}
  </div>
  <span className="text-white/70 group-hover:text-white transition-colors text-sm">
    {label}
  </span>
</label>
```

### Radio Toggle

```tsx
<div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
  isSelected
    ? 'border-[#00F0FF] bg-[#00F0FF]'
    : 'border-white/30'
}`}>
  {isSelected && (
    <div className="w-2 h-2 rounded-full bg-black" />
  )}
</div>
```

### Range Slider

```tsx
<div>
  <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
    Credibility ({range[0]} - {range[1]})
  </label>
  <div className="space-y-3">
    <div className="flex items-center gap-4">
      <input
        type="range"
        min="0"
        max="15"
        value={range[0]}
        onChange={(e) => setRange([parseInt(e.target.value), range[1]])}
        className="flex-1 accent-[#00F0FF]"
      />
      <input
        type="range"
        min="0"
        max="15"
        value={range[1]}
        onChange={(e) => setRange([range[0], parseInt(e.target.value)])}
        className="flex-1 accent-[#00F0FF]"
      />
    </div>
    <div className="flex items-center justify-between text-white/50 text-sm">
      <span>Min: {range[0]}</span>
      <span>Max: {range[1]}</span>
    </div>
  </div>
</div>
```

---

## 📊 Tables

### Data Table

```tsx
<div className="bg-white/5 border border-white/10 overflow-hidden">
  {/* Table Header */}
  <div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8 px-10 py-5 border-b border-white/10">
    <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
      Date
    </div>
    <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
      Location
    </div>
    <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
      Credibility
    </div>
    <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
      Description
    </div>
  </div>

  {/* Table Row */}
  <Link
    to={`/observation/${id}`}
    className="block border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
  >
    <div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8 px-10 py-8 items-center">
      <div className="text-white/60" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
        {date}
      </div>
      <div className="truncate" style={{ fontSize: '0.95rem' }}>
        {location}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <span className="text-white/60" style={{ fontSize: '0.875rem' }}>
          {credibility}/15
        </span>
      </div>
      <div className="truncate text-white/50" style={{ fontSize: '0.875rem' }}>
        {description}
      </div>
    </div>
  </Link>
</div>
```

---

## 🏷️ Badges & Tags

### Attribute Badge

```tsx
<span
  className="px-4 py-2 bg-white/5 border border-white/20 uppercase tracking-wider"
  style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
>
  {attribute}
</span>
```

### Metric Badge

```tsx
<div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
  C: {credibility}
</div>
```

### Count Badge

```tsx
<div
  className="bg-[#00F0FF] text-black rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-black"
  style={{ fontSize: '0.65rem', fontWeight: '700' }}
>
  {count}
</div>
```

---

## 📈 Progress Indicators

### Progress Bar

```tsx
<div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF] transition-all duration-300"
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Bar Chart Row

```tsx
<div className="flex items-center gap-4">
  <div className="w-8 text-white/30 text-right" style={{ fontSize: '0.875rem' }}>
    {index + 1}
  </div>
  <div className="flex-1">
    <div className="flex items-center justify-between mb-1">
      <span className="text-white/90" style={{ fontSize: '0.95rem' }}>{label}</span>
      <span className="text-[#00F0FF]" style={{ fontSize: '0.875rem' }}>{count.toLocaleString()}</span>
    </div>
    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]" 
        style={{ width: `${(count / maxCount) * 100}%` }}
      />
    </div>
  </div>
</div>
```

### Animated Dots

```tsx
<div className="flex items-center justify-center gap-2">
  <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
  <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
  <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
</div>
```

---

## 🗺️ Map Elements

### Map Marker

```tsx
<button
  className="absolute z-10 transition-transform hover:scale-110"
  style={{
    left: `${posX}px`,
    top: `${posY}px`,
    transform: 'translate(-50%, -50%)'
  }}
>
  <div
    className="rounded-full border-3 relative"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: isSelected ? '#00F0FF' : 'rgba(0, 240, 255, 0.9)',
      borderColor: '#000000',
      borderWidth: '3px',
      boxShadow: isSelected
        ? '0 0 30px rgba(0, 240, 255, 1)'
        : '0 0 15px rgba(0, 240, 255, 0.7)'
    }}
  />
</button>
```

### Map Tooltip

```tsx
<div
  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 border border-[#00F0FF] px-4 py-2 pointer-events-none z-50"
  style={{ bottom: `${size + 8}px`, maxWidth: '220px' }}
>
  <div className="uppercase tracking-wider text-[#00F0FF] mb-1" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
    {location}
  </div>
  <div className="text-white/50 text-xs">
    {count} case{count > 1 ? 's' : ''}
  </div>
  <div className="text-white/40 text-xs font-mono mt-1">
    {lat.toFixed(2)}°, {lon.toFixed(2)}°
  </div>
</div>
```

---

## 📱 Navigation

### Nav Link

```tsx
<Link 
  to="/collections" 
  className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
>
  Collections
</Link>
```

### Footer Link

```tsx
<Link 
  to="/browse" 
  className="text-white/50 hover:text-[#00F0FF] transition-colors" 
  style={{ fontSize: '0.875rem' }}
>
  Browse Observations
</Link>
```

### Back Button

```tsx
<button
  onClick={handleBack}
  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase tracking-wider"
  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
>
  <ArrowLeft size={16} />
  <span>Back to List</span>
</button>
```

---

## 🎛️ View Toggles

### Mode Toggle

```tsx
<div className="bg-[#12151C] border border-white/10 p-1 flex gap-1">
  <button
    onClick={() => setViewMode('map')}
    className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
      viewMode === 'map' ? 'bg-[#00F0FF] text-black' : 'text-white/60 hover:text-white'
    }`}
    style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
  >
    <Globe size={14} />
    Map
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
      viewMode === 'list' ? 'bg-[#00F0FF] text-black' : 'text-white/60 hover:text-white'
    }`}
    style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
  >
    <List size={14} />
    List
  </button>
</div>
```

---

*Code snippets extracted from Phenom Search prototype.*
