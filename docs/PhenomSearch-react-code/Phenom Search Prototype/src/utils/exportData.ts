// ============================================
// EXPORT DATA UTILITIES
// ============================================

export interface ExportableSighting {
  id: string;
  date: string;
  time: string;
  location: string;
  country: string;
  locationType: string;
  credibility: number;
  strangeness: number;
  duration: number;
  description: string;
  coordinates?: string;
  witnessTypes?: string;
  shapes?: string;
  phenomena?: string;
}

/**
 * Convert sightings data to CSV format
 */
export function exportToCSV(data: ExportableSighting[], filename: string = 'phenom-search-export') {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Date',
    'Time',
    'Location',
    'Country',
    'Location Type',
    'Credibility',
    'Strangeness',
    'Duration (min)',
    'Coordinates',
    'Witness Types',
    'UFO Shapes',
    'Phenomena',
    'Description'
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(sighting => [
      escapeCSVField(sighting.id),
      escapeCSVField(sighting.date),
      escapeCSVField(sighting.time),
      escapeCSVField(sighting.location),
      escapeCSVField(sighting.country),
      escapeCSVField(sighting.locationType),
      sighting.credibility,
      sighting.strangeness,
      sighting.duration,
      escapeCSVField(sighting.coordinates || ''),
      escapeCSVField(sighting.witnessTypes || ''),
      escapeCSVField(sighting.shapes || ''),
      escapeCSVField(sighting.phenomena || ''),
      escapeCSVField(sighting.description)
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data as JSON
 */
export function exportToJSON(data: ExportableSighting[], filename: string = 'phenom-search-export') {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalRecords: data.length,
    source: 'Phenom Search - Hatch UFO Database',
    data: data
  }, null, 2);

  downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
}

/**
 * Escape CSV fields that contain commas, quotes, or newlines
 */
function escapeCSVField(field: string | number): string {
  if (typeof field === 'number') {
    return field.toString();
  }
  
  if (!field) {
    return '';
  }

  const stringField = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

/**
 * Trigger browser download of a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format sighting data for export
 */
export function formatSightingForExport(sighting: any): ExportableSighting {
  return {
    id: sighting.id,
    date: sighting.date,
    time: sighting.time || 'Unknown',
    location: sighting.location,
    country: sighting.country,
    locationType: sighting.locationType || sighting.locale || 'Unknown',
    credibility: sighting.credibility,
    strangeness: sighting.strangeness,
    duration: sighting.duration,
    description: sighting.description || sighting.hatchDesc || '',
    coordinates: sighting.coords || (sighting.coordinates ? `${sighting.coordinates.lat}, ${sighting.coordinates.lng}` : ''),
    witnessTypes: Array.isArray(sighting.witnessType) 
      ? sighting.witnessType.join('; ') 
      : Array.isArray(sighting.observerTypes) 
        ? sighting.observerTypes.join('; ') 
        : '',
    shapes: Array.isArray(sighting.shape) 
      ? sighting.shape.join('; ') 
      : Array.isArray(sighting.ufoShapes) 
        ? sighting.ufoShapes.join('; ') 
        : '',
    phenomena: Array.isArray(sighting.phenomena) 
      ? sighting.phenomena.join('; ') 
      : ''
  };
}
