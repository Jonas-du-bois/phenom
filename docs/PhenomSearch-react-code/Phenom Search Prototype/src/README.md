# Phenom Search

> A comprehensive database for exploring historical UFO observations with scientific rigor

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Status](https://img.shields.io/badge/status-prototype-orange)
![Database](https://img.shields.io/badge/observations-18k+-green)

## Overview

Phenom Search is a modern web application for exploring and analyzing over 18,000 historical UFO/UAP observations from the Hatch UFO Database. Built with React, TypeScript, and Tailwind CSS, it features an "Airy Cinematic Science" aesthetic optimized for desktop viewing (1440px).

## ✨ Key Features

### Data Exploration
- **🗂️ Collections**: Curated sets of observations (High Credibility, Military, Physical Traces, etc.)
- **🔍 Advanced Search**: Full-text search with multi-faceted filtering
- **🗺️ Geographic Map**: Interactive Leaflet map with 12,000+ geotagged observations
- **📅 Timeline**: Chronological visualization spanning 840 CE to 2024
- **📊 Statistics**: Comprehensive data analytics and distribution charts

### Performance & Export
- **⚡ Smart Caching**: In-memory cache reduces API calls by 95%
- **📥 Data Export**: Download filtered results in CSV or JSON format
- **🚀 Optimized**: React optimization with useMemo, useCallback, and memoized contexts
- **📱 Responsive**: Instant pagination and filtering

### User Experience
- **🎨 Modern UI**: Deep Space Dark Mode (#080A0E background, #00F0FF accents)
- **🔔 Toast Notifications**: Real-time feedback for user actions
- **📖 Comprehensive Help**: FAQ, guides, and API documentation
- **404 Error Page**: Custom not-found page with navigation

## 🚀 Quick Start

```bash
# The app is deployed and ready to use
# No installation required - just open in your browser
```

## 📂 Project Structure

```
phenom-search/
├── components/           # React components
│   ├── Browse.tsx       # Search and filter interface
│   ├── CollectionsHub.tsx
│   ├── ObservationDetail.tsx
│   ├── Stats.tsx        # Statistics dashboard
│   ├── ExportButton.tsx # Data export component
│   └── ...
├── contexts/
│   └── APIContext.tsx   # API data management with caching
├── hooks/
│   └── useAPICache.ts   # Custom caching hook
├── utils/
│   └── exportData.ts    # Export utilities (CSV/JSON)
├── styles/
│   └── globals.css      # Global styles and typography
├── PERFORMANCE.md       # Performance optimization guide
├── EXPORT_GUIDE.md      # Data export documentation
└── CHANGELOG.md         # Version history
```

## 🎯 Core Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing page with hero and navigation |
| **Collections** | `/collections` | Curated observation sets |
| **Browse** | `/browse` | Search and filter interface |
| **Timeline** | `/timeline` | Chronological visualization |
| **Map** | `/map` | Geographic distribution |
| **Stats** | `/stats` | Data analytics dashboard |
| **Data Export** | `/data-export` | Export guide and documentation |
| **About** | `/about` | Project information |
| **Help** | `/help` | FAQ and guides |

## 📊 Data Export

### Supported Formats

#### CSV (Comma-Separated Values)
- Perfect for Excel, Google Sheets, statistical analysis
- UTF-8 encoding with proper escaping
- ~50KB per 100 records

#### JSON (JavaScript Object Notation)
- Ideal for developers and programmatic access
- Includes metadata and proper data typing
- ~75KB per 100 records

### How to Export

1. Navigate to any collection or search results
2. Click "Export Data" button (top right)
3. Choose format (CSV or JSON)
4. File downloads automatically

**See [EXPORT_GUIDE.md](EXPORT_GUIDE.md) for detailed documentation**

## ⚡ Performance Features

### Caching System
- **In-memory cache** with configurable TTL
- **95% faster** for cached searches (~50ms vs ~2-3s)
- **Automatic expiration** and invalidation
- **Smart key generation** based on filter parameters

### React Optimizations
- `useMemo` for expensive calculations
- `useCallback` for stable function references
- Memoized context values
- Optimized re-render prevention

**See [PERFORMANCE.md](PERFORMANCE.md) for technical details**

## 🔗 API Integration

### Base URL
```
https://phenomsearch-api.onrender.com/api/v1
```

### Key Endpoints
```bash
# Get paginated observations
GET /sightings/paginated?page=1&perPage=100

# Search with filters
GET /sightings?search=washington&minCredibility=10

# Get statistics
GET /statistics

# Get filter options
GET /filters/countries
GET /filters/observer-types
GET /filters/ufo-shapes
```

### Full API Documentation
[https://phenomsearch-api.onrender.com/api-docs/](https://phenomsearch-api.onrender.com/api-docs/)

## 🎨 Design System

### Color Palette
- **Background**: `#080A0E` (Deep Space)
- **Cards**: `#12151C`
- **Accents**: `#00F0FF` (Cyan)
- **Text**: White with varying opacity

### Typography
- **Font**: Inter
- **Spacing**: Generous (80px+ margins, 40px+ gaps)
- **Text Confinement**: Strict line-height and spacing rules

### Components
- Radial Symbol decorations
- Circular gauges for metrics
- Glass morphism effects
- Smooth animations with Motion

## 📖 Documentation

- **[PERFORMANCE.md](PERFORMANCE.md)**: Performance optimization guide
- **[EXPORT_GUIDE.md](EXPORT_GUIDE.md)**: Data export user guide  
- **[CHANGELOG.md](CHANGELOG.md)**: Version history and updates
- **[Attributions.md](Attributions.md)**: Credits and licenses

## 🔧 Technical Stack

### Frontend
- **React** 18+ with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Motion** (formerly Framer Motion) for animations
- **Recharts** for data visualization
- **Leaflet** for mapping

### Data Source
- **Hatch UFO Database** via REST API
- **18,000+** historical observations
- **12,000+** geotagged records
- Date range: **840 CE - 2024**

### Build System
- **Vite** for fast development
- **TypeScript** for type safety
- **ESLint** for code quality

## 🎓 Use Cases

### Academic Research
Export observations for statistical analysis in R, Python, or SPSS

### Geographic Analysis  
JSON export for mapping in QGIS or with geopandas

### Historical Studies
CSV export for timeline creation in Excel or Tableau

### Machine Learning
Structured JSON data for feature extraction and model training

### Database Integration
CSV import into PostgreSQL, MySQL, or SQLite

## 🐛 Known Limitations

- **Desktop Optimized**: Best viewed at 1440px width
- **Session Cache**: Cache is cleared on page refresh
- **Export Size**: Very large exports (5000+) may take a few seconds
- **API Rate Limits**: Shared API server may experience occasional delays

## 🔮 Roadmap

### Version 1.3 (Planned)
- [ ] IndexedDB for persistent caching
- [ ] Service Worker for offline mode
- [ ] Virtual scrolling for large lists
- [ ] PWA support

### Version 2.0 (Future)
- [ ] User accounts and saved searches
- [ ] Advanced data visualization
- [ ] Mobile responsive design
- [ ] Export scheduler for bulk data

## 📄 License

This project is a research prototype. Data sourced from public historical records.

## 🙏 Credits

- **Data Source**: Hatch UFO Database
- **API Provider**: Phenom Search API
- **Built With**: Figma Make
- **Open Source**: React, Tailwind, Leaflet, Recharts

## 📧 Contact

For questions, bug reports, or feature requests:
- Visit the [Help](/help) page
- Check the [API Documentation](https://phenomsearch-api.onrender.com/api-docs/)
- Review existing documentation

---

**Note**: This is a research prototype. Always verify critical information against original sources.

**Version**: 1.2.0  
**Last Updated**: December 3, 2025
