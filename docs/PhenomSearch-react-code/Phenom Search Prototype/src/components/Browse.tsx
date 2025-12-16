import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAPI } from '../contexts/APIContext';
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import ExportButton from './ExportButton';
import ProgressiveFilterPanel from './ProgressiveFilterPanel';
import { useAPICache, generateCacheKey } from '../hooks/useAPICache';

const API_BASE_URL = 'https://phenomsearch-api.onrender.com/api/v1';

interface SearchResult {
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

interface SearchResponse {
  success: boolean;
  data: SearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function Browse() {
  // Initialize cache
  const cache = useAPICache<SearchResponse>();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Results state
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use case filters
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  
  // Advanced filters
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([]);
  const [selectedWitnessTypes, setSelectedWitnessTypes] = useState<string[]>([]);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedPhenomena, setSelectedPhenomena] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([840, 2025]);
  const [credibilityRange, setCredibilityRange] = useState<[number, number]>([0, 15]);
  const [strangenessRange, setStrangenessRange] = useState<[number, number]>([0, 10]);

  // Build API query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    // Pagination
    const offset = (currentPage - 1) * itemsPerPage;
    params.append('limit', itemsPerPage.toString());
    params.append('offset', offset.toString());
    
    // Search term
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    // Collect observer types and phenomena from use cases
    const additionalObserverTypes: string[] = [];
    const additionalPhenomena: string[] = [];
    let useCaseMinCredibility: number | null = null;
    let useCaseMinStrangeness: number | null = null;
    let useCaseEndYear: number | null = null;
    
    selectedUseCases.forEach((useCase) => {
      switch (useCase) {
        case 'high-credibility':
          useCaseMinCredibility = 10;
          break;
        case 'military':
          additionalObserverTypes.push('MIL');
          break;
        case 'physical-traces':
          additionalPhenomena.push('TRC', 'DRT', 'VEG', 'LND');
          break;
        case 'historical':
          useCaseEndYear = 1950;
          break;
        case 'unexplainable':
          useCaseMinStrangeness = 8;
          break;
      }
    });
    
    // Year range
    if (yearRange[0] > 840) {
      params.append('startYear', yearRange[0].toString());
    }
    if (yearRange[1] < 2025 || useCaseEndYear) {
      const endYear = useCaseEndYear && useCaseEndYear < yearRange[1] ? useCaseEndYear : yearRange[1];
      params.append('endYear', endYear.toString());
    }
    
    // Credibility range
    const finalMinCredibility = useCaseMinCredibility && useCaseMinCredibility > credibilityRange[0] 
      ? useCaseMinCredibility 
      : credibilityRange[0];
    
    if (finalMinCredibility > 0) {
      params.append('minCredibility', finalMinCredibility.toString());
    }
    if (credibilityRange[1] < 15) {
      params.append('maxCredibility', credibilityRange[1].toString());
    }
    
    // Strangeness range
    const finalMinStrangeness = useCaseMinStrangeness && useCaseMinStrangeness > strangenessRange[0]
      ? useCaseMinStrangeness
      : strangenessRange[0];
      
    if (finalMinStrangeness > 0) {
      params.append('minStrangeness', finalMinStrangeness.toString());
    }
    if (strangenessRange[1] < 10) {
      params.append('maxStrangeness', strangenessRange[1].toString());
    }
    
    // Countries (partial match supported by API)
    if (selectedCountries.length > 0) {
      // API supports only one country parameter, so we'll use the first country
      params.append('country', selectedCountries[0]);
    }
    
    // Location types
    if (selectedLocationTypes.length > 0) {
      params.append('locale', selectedLocationTypes[0]);
    }
    
    // Observer types (comma-separated codes) - merge with use case types
    const allObserverTypes = [...new Set([...selectedWitnessTypes, ...additionalObserverTypes])];
    if (allObserverTypes.length > 0) {
      params.append('observerType', allObserverTypes.join(','));
    }
    
    // UFO shapes (comma-separated codes)
    if (selectedShapes.length > 0) {
      params.append('ufoShape', selectedShapes.join(','));
    }
    
    // Phenomena (comma-separated codes) - merge with use case phenomena
    const allPhenomena = [...new Set([...selectedPhenomena, ...additionalPhenomena])];
    if (allPhenomena.length > 0) {
      params.append('phenomenon', allPhenomena.join(','));
    }
    
    return params;
  };

  // Fetch search results from API with caching
  const fetchSearchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = buildQueryParams();
      
      // Generate cache key from all parameters
      const cacheKey = generateCacheKey('browse', {
        searchTerm,
        selectedUseCases,
        selectedCountries,
        selectedLocationTypes,
        selectedWitnessTypes,
        selectedShapes,
        selectedPhenomena,
        yearRange,
        credibilityRange,
        strangenessRange,
        currentPage
      });
      
      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setSearchResults(cachedData.data);
        setTotalResults(cachedData.pagination.total);
        setLoading(false);
        return;
      }
      
      const url = `${API_BASE_URL}/sightings?${params.toString()}`;
      
      console.log('🔍 Fetching search results:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data: SearchResponse = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setTotalResults(data.pagination.total);
        
        // Cache the result for 3 minutes
        cache.set(cacheKey, data, { expiresIn: 3 * 60 * 1000 });
        
        console.log(`✅ Found ${data.pagination.total} results`);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      console.error('❌ Error fetching search results:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedUseCases, selectedCountries, selectedLocationTypes, selectedWitnessTypes, selectedShapes, selectedPhenomena, yearRange, credibilityRange, strangenessRange, currentPage, cache]);

  // Reset to page 1 when filters change (except pagination)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    selectedUseCases.join(','),
    selectedCountries.join(','),
    selectedLocationTypes.join(','),
    selectedWitnessTypes.join(','),
    selectedShapes.join(','),
    selectedPhenomena.join(','),
    JSON.stringify(yearRange),
    JSON.stringify(credibilityRange),
    JSON.stringify(strangenessRange)
  ]);

  // Fetch results when filters or search term changes (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, searchTerm ? 500 : 0); // Debounce search term by 500ms

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchTerm,
    selectedUseCases.join(','),
    selectedCountries.join(','),
    selectedLocationTypes.join(','),
    selectedWitnessTypes.join(','),
    selectedShapes.join(','),
    selectedPhenomena.join(','),
    JSON.stringify(yearRange),
    JSON.stringify(credibilityRange),
    JSON.stringify(strangenessRange)
  ]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedUseCases([]);
    setSelectedCountries([]);
    setSelectedLocationTypes([]);
    setSelectedWitnessTypes([]);
    setSelectedShapes([]);
    setSelectedPhenomena([]);
    setYearRange([840, 2025]);
    setCredibilityRange([0, 15]);
    setStrangenessRange([0, 10]);
  };

  const hasActiveFilters = 
    searchTerm !== '' ||
    selectedUseCases.length > 0 ||
    selectedCountries.length > 0 ||
    selectedLocationTypes.length > 0 ||
    selectedWitnessTypes.length > 0 ||
    selectedShapes.length > 0 ||
    selectedPhenomena.length > 0 ||
    yearRange[0] !== 840 ||
    yearRange[1] !== 2025 ||
    credibilityRange[0] !== 0 ||
    credibilityRange[1] !== 15 ||
    strangenessRange[0] !== 0 ||
    strangenessRange[1] !== 10;

  const totalPages = Math.ceil(totalResults / itemsPerPage);

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

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="tracking-tight lowercase" style={{ fontSize: '3.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
              Browse & Search
            </h1>
            <RadialSymbol size={100} className="text-white opacity-10" rays={20} />
          </div>

          {/* Glassmorphic Search Bar */}
          <div 
            className="mb-12 backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg overflow-hidden"
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
            
            {/* Action Buttons */}
            <div className="px-8 pb-8 flex items-center gap-4">
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
                {hasActiveFilters && (
                  <span className={`${showFilters ? 'bg-black/30 text-white' : 'bg-[#00F0FF]/20 text-[#00F0FF]'} px-2 py-0.5 rounded-full text-xs`}>
                    {selectedUseCases.length + selectedCountries.length + selectedLocationTypes.length + selectedWitnessTypes.length + selectedShapes.length + selectedPhenomena.length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-3 text-white/50 hover:text-white transition-colors text-sm uppercase tracking-wider"
                  style={{ letterSpacing: '0.1em' }}
                >
                  <X size={16} />
                  Reset
                </button>
              )}
              
              <div className="flex-1" />
              
              <ExportButton 
                data={searchResults} 
                filename={`phenom-search-${searchTerm ? 'search-' + searchTerm.replace(/\s+/g, '-') : 'browse'}`}
                label="Export Results"
              />
              
              <div className="text-white/40 uppercase tracking-wider ml-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                {loading ? 'Loading...' : `${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''}`}
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Advanced Filters Sidebar - Sliding Panel */}
            <AnimatePresence>
              {showFilters && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setShowFilters(false)}
                  />
                  
                  {/* Sliding Panel */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed left-0 top-0 bottom-0 w-[480px] bg-[#080A0E] z-50 overflow-y-auto"
                    style={{
                      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    <div className="p-8">
                      <ProgressiveFilterPanel 
                        onClose={() => setShowFilters(false)}
                        selectedUseCases={selectedUseCases}
                        setSelectedUseCases={setSelectedUseCases}
                        selectedCountries={selectedCountries}
                        setSelectedCountries={setSelectedCountries}
                        selectedLocationTypes={selectedLocationTypes}
                        setSelectedLocationTypes={setSelectedLocationTypes}
                        selectedWitnessTypes={selectedWitnessTypes}
                        setSelectedWitnessTypes={setSelectedWitnessTypes}
                        selectedShapes={selectedShapes}
                        setSelectedShapes={setSelectedShapes}
                        selectedPhenomena={selectedPhenomena}
                        setSelectedPhenomena={setSelectedPhenomena}
                        yearRange={yearRange}
                        setYearRange={setYearRange}
                        credibilityRange={credibilityRange}
                        setCredibilityRange={setCredibilityRange}
                        strangenessRange={strangenessRange}
                        setStrangenessRange={setStrangenessRange}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Results */}
            <div>
              {loading ? (
                <div className="py-20">
                  <LoadingState message="Searching observations..." />
                </div>
              ) : (
                <>
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

                    {/* Table Rows */}
                    {searchResults.length > 0 ? (
                      <>
                        {searchResults.map((sighting) => (
                          <Link
                            key={sighting.id}
                            to={`/observation/${sighting.id}`}
                            state={{ from: '/browse' }}
                            className="block border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                          >
                            <div className="grid grid-cols-[140px_1fr_140px_2fr] gap-8 px-10 py-8 items-center">
                              <div className="text-white/60" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                {sighting.date}
                              </div>
                              <div className="truncate" style={{ fontSize: '0.95rem' }}>
                                {sighting.location}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span className="text-white/60" style={{ fontSize: '0.875rem' }}>
                                  {sighting.credibility}/15
                                </span>
                              </div>
                              <div className="truncate text-white/50" style={{ fontSize: '0.875rem' }}>
                                {sighting.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    ) : (
                      <div className="px-10">
                        <EmptyState 
                          title="No Results Found"
                          message="No observations match your current search and filter criteria."
                          suggestion="Try adjusting your filters or search terms to see more results."
                          onClearFilters={clearAllFilters}
                          showClearFilters={hasActiveFilters}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {totalResults > itemsPerPage && (
                    <div className="mt-12 flex items-center justify-between">
                      <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults.toLocaleString()} results
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                        >
                          Previous
                        </button>
                        <div className="px-6 py-3 bg-[#00F0FF] text-black uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Page {currentPage} of {totalPages}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                          className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
