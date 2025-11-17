# Observation Types

Phenom uses a standardized classification system for UFO and paranormal phenomena based on established ufology terminology. Each observation can be tagged with one or more type codes.

## Type Codes

Observations can be classified using 27 predefined phenomenon codes. These codes help categorize different aspects of UFO sightings and related events.

### Complete Type List

| Code | Label | Description |
|------|-------|-------------|
| **WAV** | Vague/cluster/flap | Wave/cluster/flap - Multiple sightings in a concentrated area/time |
| **TCH** | Nouveaux détails/indices techniques | New technical details/clues about UFO capabilities |
| **HST** | Compte historique | Historical account - Past sighting being reported |
| **SND** | Sons d'OVNI entendus/enregistrés | UFO sounds heard or recorded |
| **ODD** | Atypique/Forteana/Paranormal | Atypical/Forteana/paranormal occurrences |
| **LND** | Atterrissage d'OVNI | UFO landing or any part touches ground |
| **SUB** | Submersible | Rises from or submerges into water (USO - Unidentified Submerged Object) |
| **OBS** | Véhicules d'observation/poursuite | Observation/chasing vehicles - UFO being pursued or observing |
| **RAY** | Lumière bizarre/projecteur/faisceau | Odd light/searchlight/beam/laser-like emissions |
| **SIG** | Signaux/réponses/communications | Signals/responses to/from/between UFO's |
| **ANI** | Animaux affectés ou blessés | Animals affected or injuries/marks on animals |
| **HUM** | Humains affectés | Humans affected: Injury/burns/marks/abduction/death |
| **INJ** | Blessures/maladie/mort/mutilations | Injuries, illness/death, mutilations (humans or animals) |
| **VEH** | Véhicule affecté | Vehicle affected: Marks/damage/EME (electromagnetic) effects |
| **BLD** | Bâtiment/structure artificielle | Building/man-made structure/roads/power lines affected |
| **DRT** | Traces de terre/sol | Dirt/soil traces/marks/footprints etc. |
| **VEG** | Plantes affectées | Plants affected or sampled/crop circles |
| **PHT** | Photos/films/vidéos prises | Photos/movies/videos taken of phenomenon |
| **RDA** | Radiation détectée | Radiation/high energy fields detected or measured |
| **TRC** | Traces physiques | Physical traces left behind (generic) |
| **NOC** | Aucune entité vue | No entity/occupant seen by observer(s) |
| **CMF** | Camouflage/déguisement | Camouflage/disguise - UFO attempting to hide or mimic |
| **MID** | Probable mésidentification | Likely mis-identification (conventional explanation possible) |
| **CNT** | Relation contactée | Contactee related - Claims of ongoing communication |
| **OID** | Humanoïde | Humanoid: Small alien or "Grey" type entity seen |
| **COV** | Indication de dissimulation | Indication of coverup - Evidence of official suppression |
| **OGA** | Agences gouvernementales | Non-Covert Government Agencies - Official investigation |

## Usage in Application

### Backend Schema

Observation types are defined as an enum in the Mongoose schema:

```javascript
// backend/src/models/Observation.js
type: {
  type: String,
  enum: [
    'WAV', 'TCH', 'HST', 'SND', 'ODD', 'LND', 'SUB', 'OBS', 'RAY', 'SIG',
    'ANI', 'HUM', 'INJ', 'VEH', 'BLD', 'DRT', 'VEG', 'PHT', 'RDA', 'TRC',
    'NOC', 'CMF', 'MID', 'CNT', 'OID', 'COV', 'OGA'
  ],
  required: false  // Type is optional
}
```

### Constants Definition

```javascript
// backend/src/constants/observationTypes.js
export const OBSERVATION_TYPES = {
  WAV: { code: 'WAV', label: 'Vague/cluster/flap', description: 'Wave/cluster/flap' },
  TCH: { code: 'TCH', label: 'Nouveaux détails/indices techniques', description: 'New technical details/clues' },
  // ... all 27 types
}

export const OBSERVATION_TYPE_CODES = Object.keys(OBSERVATION_TYPES)
```

### API Validation

When creating or updating an observation, the type must be one of the valid codes:

```javascript
// backend/src/validators/observation.validator.js
body('type')
  .optional()
  .isIn(['WAV', 'TCH', 'HST', /* ... all codes */ ])
  .withMessage('Invalid observation type')
```

### Frontend Usage

**Type Selector Component**:
```vue
<script setup>
import { ref } from 'vue'
import { OBSERVATION_TYPES } from '@/constants/observationTypes'

const selectedType = ref('')
const types = Object.values(OBSERVATION_TYPES)
</script>

<template>
  <select v-model="selectedType">
    <option value="">Select type (optional)</option>
    <option
      v-for="type in types"
      :key="type.code"
      :value="type.code"
    >
      {{ type.code }} - {{ type.label }}
    </option>
  </select>
</template>
```

**Display Type Badge**:
```vue
<template>
  <span v-if="observation.type" class="type-badge">
    {{ observation.type }}
  </span>
</template>
```

## Common Type Combinations

Observations often involve multiple aspects. Common combinations include:

### Classic UFO Sighting
- **NOC** (No occupant seen)
- **RAY** (Light emissions)
- **PHT** (Photos taken)

### Landing Case
- **LND** (Landing)
- **DRT** (Ground traces)
- **TRC** (Physical traces)
- **VEG** (Vegetation affected)

### Close Encounter
- **OID** (Humanoid entity)
- **HUM** (Human affected)
- **VEH** (Vehicle affected)

### Water-Related
- **SUB** (Submersible)
- **RAY** (Light from water)

### High Strangeness
- **ODD** (Atypical phenomena)
- **ANI** (Animal reactions)
- **SND** (Unusual sounds)

## Search and Filtering

### Filter by Type

**API Request**:
```http
GET /api/v1/observations?type=RAY
```

**Response**: All observations with type 'RAY'

### Multiple Types

Frontend can filter observations by multiple types:

```javascript
const filterByTypes = (observations, types) => {
  return observations.filter(obs =>
    types.includes(obs.type)
  )
}

// Example: Show all landing and physical trace cases
const landingCases = filterByTypes(observations, ['LND', 'DRT', 'TRC'])
```

## Statistics

### Count by Type

```javascript
// Aggregation query
const stats = await Observation.aggregate([
  { $group: {
    _id: '$type',
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
])

// Result:
[
  { _id: 'RAY', count: 45 },
  { _id: 'NOC', count: 38 },
  { _id: 'PHT', count: 32 },
  // ...
]
```

### Most Common Types

```javascript
const getMostCommonTypes = (observations, limit = 5) => {
  const counts = {}
  
  observations.forEach(obs => {
    if (obs.type) {
      counts[obs.type] = (counts[obs.type] || 0) + 1
    }
  })
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([type, count]) => ({ type, count }))
}
```

## Type Guidelines

### When to Use Each Type

**WAV (Wave/Cluster)**
- Use when reporting part of a larger wave of sightings
- Multiple sightings in same area over short time period

**RAY (Light/Beam)**
- Most common type for light-based sightings
- Use for searchlight-like beams, lasers, or unusual lights

**LND (Landing)**
- Object clearly touched ground
- Evidence of landing gear marks or impressions

**OID (Humanoid)**
- Entity description is important
- Small, grey-type beings most common
- Use with HUM if there was interaction

**MID (Misidentification)**
- When conventional explanation is likely
- Honest mistakes (planets, aircraft, satellites)
- Still valuable data for research

**COV (Coverup)**
- Evidence suggests official suppression
- Missing records, intimidation, confiscated evidence

### Optional Field

The type field is **optional** because:
- Not all observations fit into categories
- Observer may not know which type applies
- Classification may be uncertain
- Historical reports may lack detail

## Frontend Type Display

### Color Coding

```css
.type-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.type-RAY { background-color: #FCD34D; color: #92400E; }
.type-LND { background-color: #86EFAC; color: #14532D; }
.type-OID { background-color: #C7D2FE; color: #3730A3; }
.type-PHT { background-color: #93C5FD; color: #1E3A8A; }
/* ... etc */
```

### Type Icon Mapping

```javascript
const typeIcons = {
  RAY: 'lightbulb',
  LND: 'arrow-down',
  OID: 'person',
  PHT: 'camera',
  SUB: 'water',
  VEH: 'car',
  // ... etc
}
```

## Data Export

### CSV Export with Types

```javascript
const exportObservationsCSV = (observations) => {
  const rows = observations.map(obs => [
    obs.title,
    obs.description,
    obs.type || 'N/A',
    obs.location.coordinates.join(','),
    obs.date
  ])
  
  const csv = [
    ['Title', 'Description', 'Type', 'Location', 'Date'],
    ...rows
  ].map(row => row.join(',')).join('\n')
  
  return csv
}
```

## Related Documentation

- [Database Schema](Database-Schema) - Observation model details
- [API Reference](API-Reference) - API endpoints for filtering
- [Frontend Architecture](Frontend-Architecture) - UI implementation
- [Backend Architecture](Backend-Architecture) - Validation and storage

## References

This classification system is adapted from standard ufology terminology and databases used by:
- NUFORC (National UFO Reporting Center)
- MUFON (Mutual UFO Network)
- Project Blue Book archives
- Various international UFO research organizations

The codes provide a standardized way to categorize and analyze UFO phenomena across different reporting systems.
