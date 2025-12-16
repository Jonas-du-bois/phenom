import { useMemo } from 'react';
import { useAPI, type Sighting } from '../contexts/APIContext';

interface FilterOptions {
  searchTerm?: string;
  countries?: string[];
  locationTypes?: string[];
  witnessTypes?: string[];
  shapes?: string[];
  phenomena?: string[];
  minCredibility?: number;
  maxCredibility?: number;
  minStrangeness?: number;
  maxStrangeness?: number;
  startYear?: number;
  endYear?: number;
  hasCoordinates?: boolean;
}

export function useFilteredSightings(filters: FilterOptions = {}) {
  const { sightings } = useAPI();

  const filteredSightings = useMemo(() => {
    let filtered = [...sightings];

    // Search term (recherche dans description et location)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.description.toLowerCase().includes(search) ||
        s.location.toLowerCase().includes(search) ||
        s.country.toLowerCase().includes(search)
      );
    }

    // Filter by countries
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(s => 
        filters.countries!.includes(s.country)
      );
    }

    // Filter by location types
    if (filters.locationTypes && filters.locationTypes.length > 0) {
      filtered = filtered.filter(s => 
        filters.locationTypes!.includes(s.locationType)
      );
    }

    // Filter by witness types
    if (filters.witnessTypes && filters.witnessTypes.length > 0) {
      filtered = filtered.filter(s => 
        s.witnessType.some(wt => filters.witnessTypes!.includes(wt))
      );
    }

    // Filter by shapes
    if (filters.shapes && filters.shapes.length > 0) {
      filtered = filtered.filter(s => 
        s.shape.some(sh => filters.shapes!.includes(sh))
      );
    }

    // Filter by phenomena
    if (filters.phenomena && filters.phenomena.length > 0) {
      filtered = filtered.filter(s => 
        s.phenomena.some(ph => filters.phenomena!.includes(ph))
      );
    }

    // Filter by credibility
    if (filters.minCredibility !== undefined) {
      filtered = filtered.filter(s => s.credibility >= filters.minCredibility!);
    }
    if (filters.maxCredibility !== undefined) {
      filtered = filtered.filter(s => s.credibility <= filters.maxCredibility!);
    }

    // Filter by strangeness
    if (filters.minStrangeness !== undefined) {
      filtered = filtered.filter(s => s.strangeness >= filters.minStrangeness!);
    }
    if (filters.maxStrangeness !== undefined) {
      filtered = filtered.filter(s => s.strangeness <= filters.maxStrangeness!);
    }

    // Filter by year
    if (filters.startYear || filters.endYear) {
      filtered = filtered.filter(s => {
        // Parse date (format peut être "6/24/1947" ou "1950?" etc.)
        const dateStr = s.date;
        let year: number | null = null;
        
        // Try different formats
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          year = parseInt(parts[2]) || parseInt(parts[0]);
        } else if (dateStr.includes('-')) {
          year = parseInt(dateStr.split('-')[0]);
        } else {
          year = parseInt(dateStr.replace(/\D/g, ''));
        }

        if (!year || isNaN(year)) return false;

        if (filters.startYear && year < filters.startYear) return false;
        if (filters.endYear && year > filters.endYear) return false;

        return true;
      });
    }

    // Filter by coordinates presence
    if (filters.hasCoordinates !== undefined) {
      filtered = filtered.filter(s => 
        filters.hasCoordinates ? s.latLon !== null : s.latLon === null
      );
    }

    return filtered;
  }, [sightings, filters]);

  return filteredSightings;
}
