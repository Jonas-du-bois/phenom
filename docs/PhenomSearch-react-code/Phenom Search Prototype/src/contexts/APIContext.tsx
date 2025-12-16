import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

// ============================================
// TYPES POUR L'API PHENOMSEARCH
// ============================================
export interface APISighting {
  id: string;
  date: string;
  time: string;
  location: string;
  country: string;
  description: string;
  credibility: number;
  strangeness: number;
  duration: number;
  locale: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  observerTypes: string[];
  ufoShapes: string[];
  phenomena: string[];
}

export interface APIResponse {
  success: boolean;
  data: APISighting[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FilterOption {
  code: string;
  description: string;
}

export interface Statistics {
  totalSightings: number;
  dateRange: {
    minYear: number;
    maxYear: number;
    span: number;
  };
  credibilityStats: {
    min: number;
    max: number;
    avg: string;
  };
  strangenessStats: {
    min: number;
    max: number;
    avg: string;
  };
  topCountries: Array<{ country: string; count: number }>;
  observerTypeDistribution: Record<string, number>;
  ufoShapeDistribution: Record<string, number>;
  sightingsWithCoordinates: number;
}

export interface Sighting {
  id: string;
  date: string;
  time: string;
  location: string;
  country: string;
  locationType: string;
  imageUrl: string;
  credibility: number;
  strangeness: number;
  summary: string;
  duration: number;
  elevation: string;
  coords: string;
  latLon: [number, number] | null;
  sourceId: string;
  hatchDesc: string;
  description: string;
  attributes: string[];
  reference: string;
  source: string;
  witnessType: string[];
  shape: string[];
  phenomena: string[];
}

interface Metadata {
  countries: Array<{ name: string }>;
  locationTypes: Array<{ name: string }>;
  witnessTypes: Array<{ name: string; description?: string }>;
  shapes: Array<{ name: string; description?: string }>;
  phenomena: Array<{ name: string; description?: string }>;
}

interface APIContextType {
  sightings: Sighting[];
  loading: boolean;
  loadingProgress: number;
  error: string | null;
  statistics: Statistics | null;
  countries: string[];
  locales: string[];
  observerTypes: FilterOption[];
  ufoShapes: FilterOption[];
  phenomenaTypes: FilterOption[];
  metadata: Metadata;
  refetch: () => void;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

const API_BASE_URL = 'https://phenomsearch-api.onrender.com/api/v1';

// Mapper les données API vers le format Sighting interne
const mapAPISightingToInternal = (apiSighting: APISighting): Sighting => {
  let lat: number | null = null;
  let lng: number | null = null;
  let coords = 'Unknown';
  
  if (apiSighting.coordinates) {
    lat = apiSighting.coordinates.lat;
    lng = apiSighting.coordinates.lng;
    
    // Créer le format coords texte
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    coords = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  }

  // Générer une image placeholder basée sur le type de locale
  const getImageForLocale = (locale: string): string => {
    const localeMap: { [key: string]: string } = {
      'Pasture': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'Farmlands': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'Forest': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
      'Desert': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
      'Urban': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      'Town & City': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      'Rural': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'Ocean': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      'Sea': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      'Coastal': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      'Airport': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
      'Highway': 'https://images.unsplash.com/photo-1533586902374-8a1c7c7e4b22?w=800',
      'Mountains': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'Lake': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
      'River': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
      'Coast': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
      'City': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
      'Town': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'Village': 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      'Farm': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'Field': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      'Road': 'https://images.unsplash.com/photo-1533586902374-8a1c7c7e4b22?w=800',
      'Street': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
      'Park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      'School': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      'Military': 'https://images.unsplash.com/photo-1541542223576-c41450e6c5b5?w=800',
      'Base': 'https://images.unsplash.com/photo-1541542223576-c41450e6c5b5?w=800',
    };
    return localeMap[locale] || 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800';
  };

  return {
    id: apiSighting.id,
    date: apiSighting.date,
    time: apiSighting.time || 'Unknown',
    location: apiSighting.location,
    country: apiSighting.country,
    locationType: apiSighting.locale || 'Unknown',
    imageUrl: getImageForLocale(apiSighting.locale),
    credibility: apiSighting.credibility,
    strangeness: apiSighting.strangeness,
    summary: apiSighting.description.substring(0, 150) + (apiSighting.description.length > 150 ? '...' : ''),
    duration: apiSighting.duration,
    elevation: 'Unknown',
    coords: coords,
    latLon: lat !== null && lng !== null ? [lat, lng] : null,
    sourceId: apiSighting.id,
    hatchDesc: apiSighting.description,
    description: apiSighting.description,
    attributes: [...apiSighting.observerTypes, ...apiSighting.ufoShapes, ...apiSighting.phenomena],
    reference: apiSighting.id,
    source: 'Hatch UFO Database',
    witnessType: apiSighting.observerTypes,
    shape: apiSighting.ufoShapes,
    phenomena: apiSighting.phenomena,
  };
};

export function APIProvider({ children }: { children: ReactNode }) {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et métadonnées
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [locales, setLocales] = useState<string[]>([]);
  const [observerTypes, setObserverTypes] = useState<FilterOption[]>([]);
  const [ufoShapes, setUfoShapes] = useState<FilterOption[]>([]);
  const [phenomenaTypes, setPhenomenaTypes] = useState<FilterOption[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);

      console.log('🚀 Starting data fetch from Phenom Search API...');

      // 1. Charger les statistiques d'abord pour connaître le total
      console.log('📊 Fetching statistics...');
      const statsResponse = await fetch(`${API_BASE_URL}/statistics`);
      if (!statsResponse.ok) throw new Error('Failed to fetch statistics');
      const statsData = await statsResponse.json();
      setStatistics(statsData.data);
      setLoadingProgress(5);

      const totalSightings = statsData.data.totalSightings;
      console.log(`📈 Total sightings in database: ${totalSightings}`);

      // 2. Charger les filtres en parallèle
      console.log('🔍 Fetching filter options...');
      const [countriesRes, localesRes, observerTypesRes, ufoShapesRes, phenomenaRes] = await Promise.all([
        fetch(`${API_BASE_URL}/filters/countries`),
        fetch(`${API_BASE_URL}/filters/locales`),
        fetch(`${API_BASE_URL}/filters/observer-types`),
        fetch(`${API_BASE_URL}/filters/ufo-shapes`),
        fetch(`${API_BASE_URL}/filters/phenomena`),
      ]);

      const [countriesData, localesData, observerTypesData, ufoShapesData, phenomenaData] = await Promise.all([
        countriesRes.json(),
        localesRes.json(),
        observerTypesRes.json(),
        ufoShapesRes.json(),
        phenomenaRes.json(),
      ]);

      setCountries(countriesData.data || []);
      setLocales(localesData.data || []);
      setObserverTypes(observerTypesData.data || []);
      setUfoShapes(ufoShapesData.data || []);
      setPhenomenaTypes(phenomenaData.data || []);
      setLoadingProgress(10);

      console.log('✅ Filters loaded successfully');

      // 3. Charger toutes les observations par pagination
      const perPage = 500; // Maximum autorisé
      const totalPages = Math.ceil(totalSightings / perPage);
      let allSightings: APISighting[] = [];

      console.log(`📦 Fetching ${totalPages} pages with ${perPage} items each...`);

      // Charger les pages en parallèle par batch de 5 pour ne pas surcharger le serveur
      const batchSize = 5;
      for (let batchStart = 1; batchStart <= totalPages; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize - 1, totalPages);
        const batchPromises = [];

        for (let page = batchStart; page <= batchEnd; page++) {
          batchPromises.push(
            fetch(`${API_BASE_URL}/sightings/paginated?page=${page}&perPage=${perPage}`)
              .then(res => res.json())
              .then(data => {
                console.log(`✓ Page ${page}/${totalPages} loaded (${data.data.length} items)`);
                return data.data;
              })
          );
        }

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(pageData => {
          allSightings = [...allSightings, ...pageData];
        });

        // Mettre à jour la progression
        const progress = 10 + Math.floor((batchEnd / totalPages) * 85);
        setLoadingProgress(progress);
      }

      console.log(`✅ All ${allSightings.length} sightings loaded`);

      // 4. Mapper les données
      setLoadingProgress(95);
      const mappedSightings = allSightings.map(mapAPISightingToInternal);
      
      console.log(`✅ Successfully loaded and mapped ${mappedSightings.length} sightings`);
      setSightings(mappedSightings);
      setLoadingProgress(100);
      
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Créer l'objet metadata pour le ProgressiveFilterPanel - optimisé avec useMemo
  const metadata: Metadata = useMemo(() => ({
    countries: countries.map(c => ({ name: c })),
    locationTypes: locales.map(l => ({ name: l })),
    witnessTypes: observerTypes.map(ot => ({ name: ot.code, description: ot.description })),
    shapes: ufoShapes.map(s => ({ name: s.code, description: s.description })),
    phenomena: phenomenaTypes.map(p => ({ name: p.code, description: p.description })),
  }), [countries, locales, observerTypes, ufoShapes, phenomenaTypes]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    sightings, 
    loading, 
    loadingProgress,
    error, 
    statistics,
    countries,
    locales,
    observerTypes,
    ufoShapes,
    phenomenaTypes,
    metadata,
    refetch: fetchAllData 
  }), [sightings, loading, loadingProgress, error, statistics, countries, locales, observerTypes, ufoShapes, phenomenaTypes, metadata]);

  return (
    <APIContext.Provider value={contextValue}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPI() {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
}
