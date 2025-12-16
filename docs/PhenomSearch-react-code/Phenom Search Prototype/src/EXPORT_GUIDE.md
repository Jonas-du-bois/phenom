# Data Export Guide

## Overview
Phenom Search allows you to export observation data in multiple formats for offline analysis, research, or integration with other tools.

## Quick Start

### From Collections
1. Navigate to any collection (e.g., `/collections/high-credibility`)
2. Click the "Export Collection" button in the top right
3. Choose your format (CSV or JSON)
4. File downloads automatically

### From Search Results
1. Go to Browse page (`/browse`)
2. Apply your desired filters and search
3. Click "Export Results" button
4. Select format and download

## Export Formats

### CSV (Comma-Separated Values)

**Best for:**
- Excel, Google Sheets, Numbers
- Statistical analysis (R, Python pandas)
- Database imports
- Non-technical users

**Format:**
```csv
ID,Date,Time,Location,Country,Location Type,Credibility,Strangeness,Duration (min),Coordinates,Witness Types,UFO Shapes,Phenomena,Description
19470624-001,1947-06-24,15:00,"Mount Rainier, WA",USA,Mountains,12,8,180,"47.2396° N, 121.7542° W",CIV;PIL,DSK,FLT,"Pilot Kenneth Arnold reported..."
```

**Features:**
- Proper escaping for commas, quotes, newlines
- UTF-8 encoding
- Standard delimiter (comma)
- Headers included

### JSON (JavaScript Object Notation)

**Best for:**
- Developers and programmers
- API integration
- Data analysis with JavaScript/Python
- Custom applications

**Format:**
```json
{
  "exportDate": "2025-12-03T10:30:00.000Z",
  "totalRecords": 1234,
  "source": "Phenom Search - Hatch UFO Database",
  "data": [
    {
      "id": "19470624-001",
      "date": "1947-06-24",
      "time": "15:00",
      "location": "Mount Rainier, WA",
      "country": "USA",
      "locationType": "Mountains",
      "credibility": 12,
      "strangeness": 8,
      "duration": 180,
      "coordinates": "47.2396° N, 121.7542° W",
      "witnessTypes": "CIV; PIL",
      "shapes": "DSK",
      "phenomena": "FLT",
      "description": "Pilot Kenneth Arnold reported..."
    }
  ]
}
```

**Features:**
- Proper data typing (numbers, strings, arrays)
- Formatted for readability (pretty-printed)
- Includes export metadata
- Standard JSON specification

## Data Fields

### Core Fields (Always Included)
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique observation identifier |
| `date` | string | Date of observation (YYYY-MM-DD) |
| `time` | string | Time of observation (HH:MM) |
| `location` | string | Location description |
| `country` | string | Country where observed |
| `locationType` | string | Type of location (Urban, Rural, etc.) |
| `credibility` | number | Credibility score (0-15) |
| `strangeness` | number | Strangeness index (0-10) |
| `duration` | number | Duration in minutes |
| `description` | string | Full observation description |

### Optional Fields (When Available)
| Field | Type | Description |
|-------|------|-------------|
| `coordinates` | string | Geographic coordinates |
| `witnessTypes` | string | Types of witnesses (separated by `;`) |
| `shapes` | string | UFO shapes observed (separated by `;`) |
| `phenomena` | string | Associated phenomena (separated by `;`) |

## Use Cases

### 1. Academic Research
**Export:** All observations (Browse page without filters)  
**Format:** CSV for statistical analysis  
**Tools:** R, Python pandas, SPSS

```python
import pandas as pd

# Load exported data
df = pd.read_csv('phenom-search-browse.csv')

# Analyze credibility distribution
credibility_dist = df['Credibility'].value_counts()

# Filter high-credibility cases
high_cred = df[df['Credibility'] >= 10]
```

### 2. Geographic Analysis
**Export:** Observations with coordinates  
**Format:** JSON for programmatic processing  
**Tools:** QGIS, Python geopandas, Leaflet

```javascript
// Load JSON export
fetch('phenom-search-export.json')
  .then(res => res.json())
  .then(data => {
    // Filter observations with coordinates
    const withCoords = data.data.filter(obs => obs.coordinates);
    
    // Plot on map
    withCoords.forEach(obs => {
      addMarkerToMap(obs.coordinates, obs.description);
    });
  });
```

### 3. Historical Timeline
**Export:** Historical collection  
**Format:** CSV for Excel  
**Goal:** Create timeline visualizations

Steps:
1. Export Historical collection
2. Open in Excel
3. Create pivot table by year
4. Generate timeline chart

### 4. Machine Learning
**Export:** All observations  
**Format:** JSON for feature extraction  
**Tools:** scikit-learn, TensorFlow

```python
import json
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Load data
with open('phenom-search-export.json', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data['data'])

# Feature engineering
features = df[['credibility', 'strangeness', 'duration']]
labels = df['shapes']

# Train model
model = RandomForestClassifier()
model.fit(features, labels)
```

### 5. Database Integration
**Export:** Complete dataset  
**Format:** CSV for database import  
**Tools:** PostgreSQL, MySQL, SQLite

```sql
-- PostgreSQL example
CREATE TABLE ufo_sightings (
    id VARCHAR(50) PRIMARY KEY,
    date DATE,
    time TIME,
    location TEXT,
    country VARCHAR(100),
    credibility INTEGER,
    strangeness INTEGER,
    duration INTEGER,
    description TEXT
);

COPY ufo_sightings
FROM '/path/to/phenom-search-export.csv'
DELIMITER ','
CSV HEADER;
```

## Best Practices

### File Naming
Exports are automatically named with descriptive filenames:
- Collections: `phenom-search-{collection-id}.{format}`
- Search results: `phenom-search-search-{term}.{format}`
- Browse: `phenom-search-browse.{format}`

### Size Considerations
- **CSV**: ~50KB per 100 records
- **JSON**: ~75KB per 100 records (more verbose but includes metadata)
- Large exports (1000+ records) may take a few seconds

### Character Encoding
All exports use UTF-8 encoding. If opening in Excel:
1. Use "Get Data" → "From Text/CSV"
2. Select UTF-8 encoding
3. Import normally

### Refreshing Data
Exports are snapshots at the time of download. To get updated data:
1. Return to Phenom Search
2. Re-run your search/filters
3. Export again

## Programmatic Access

For automated or frequent data access, consider using the API directly:

**Base URL:** `https://phenomsearch-api.onrender.com/api/v1`

**Documentation:** [https://phenomsearch-api.onrender.com/api-docs/](https://phenomsearch-api.onrender.com/api-docs/)

### Example: Fetch High Credibility Cases
```bash
curl "https://phenomsearch-api.onrender.com/api/v1/sightings?minCredibility=10&limit=100"
```

### Example: Search by Location
```bash
curl "https://phenomsearch-api.onrender.com/api/v1/sightings?search=washington&startYear=1947"
```

## Troubleshooting

### Issue: Export button is disabled
**Cause:** No data to export  
**Solution:** Apply filters or navigate to a collection with data

### Issue: CSV opens incorrectly in Excel
**Cause:** Excel may not detect UTF-8 encoding  
**Solution:** 
1. Open Excel
2. File → Import → Text/CSV
3. Select file and choose UTF-8 encoding
4. Complete import wizard

### Issue: JSON file is too large
**Cause:** Exporting thousands of records  
**Solution:** 
- Apply more specific filters
- Use API with pagination for very large datasets
- Consider exporting in smaller batches

### Issue: Special characters appear garbled
**Cause:** Incorrect character encoding  
**Solution:** Ensure your application is set to UTF-8 encoding

## Rate Limits

- **Export Frequency:** No limits on exports
- **File Size:** Client-side processing, no server limits
- **Concurrent Exports:** One export per browser tab at a time

## Privacy and Terms

- All data is sourced from public historical records
- No personal information is included in exports
- Data is provided for research and educational purposes
- Proper attribution to "Phenom Search - Hatch UFO Database" is appreciated

## Support

For issues with exports or questions about data format:
- Check the [Help & FAQ](/help) page
- Visit the [Data Export Guide](/data-export) page
- Review API documentation for programmatic access

---

**Note:** This is a research prototype. Data accuracy and completeness may vary. Always verify critical information against original sources.
