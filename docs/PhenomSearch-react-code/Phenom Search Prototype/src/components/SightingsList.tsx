import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAPI, type Sighting } from '../contexts/APIContext';
import Header from './Header';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ExportButton from './ExportButton';
import { collections } from './collectionsData';
import RadialSymbol from './RadialSymbol';

export default function SightingsList() {
  const { id } = useParams();
  const { sightings: mockSightings, loading } = useAPI();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const collection = collections.find(c => c.id === id);
  const collectionTitle = collection?.title || 'Sightings';

  if (loading) {
    return <LoadingState message={`Loading ${collectionTitle} collection...`} />;
  }

  // Filter sightings based on collection - optimized with useMemo
  const filteredSightings = useMemo((): Sighting[] => {
    switch (id) {
      case 'high-credibility':
        return mockSightings.filter(s => s.credibility >= 10);
      
      case 'military':
        return mockSightings.filter(s => 
          s.witnessType.some(wt => ['MIL', 'HQO'].includes(wt))
        );
      
      case 'physical-traces':
        return mockSightings.filter(s => 
          s.phenomena.some(p => ['TRC', 'DRT', 'VEG', 'LND'].includes(p))
        );
      
      case 'historical':
        return mockSightings.filter(s => {
          const year = parseInt(s.date.split(/[-/]/)[0]);
          return !isNaN(year) && year < 1950;
        });
      
      case 'unexplainable':
        return mockSightings.filter(s => s.strangeness >= 8);
      
      case 'photographic':
        return mockSightings.filter(s => s.phenomena.includes('PHT'));
      
      default:
        return mockSightings;
    }
  }, [id, mockSightings]);

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header showBack backTo="/collections" backLabel="Back to Collections" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="mb-3 tracking-tight lowercase" style={{ fontSize: '3.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                {collectionTitle}
              </h1>
              <p className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                {filteredSightings.length} verified observation{filteredSightings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <ExportButton 
                data={filteredSightings} 
                filename={`phenom-search-${id || 'collection'}`}
                label="Export Collection"
              />
              <RadialSymbol size={100} className="text-white opacity-10" rays={18} />
            </div>
          </div>

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
                Summary
              </div>
            </div>

            {/* Table Rows */}
            {filteredSightings.length > 0 ? (
              filteredSightings
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((sighting) => (
                  <Link
                    key={sighting.id}
                    to={`/observation/${sighting.id}?from=${id}`}
                    state={{ from: `/collections/${id}` }}
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
                        {sighting.summary}
                      </div>
                    </div>
                  </Link>
                ))
            ) : (
              <div className="px-10">
                <EmptyState 
                  title="No Observations Found"
                  message={`The collection "${collection?.title}" currently has no matching observations.`}
                  suggestion="This collection's criteria may not match any observations in the current database."
                  showClearFilters={false}
                />
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredSightings.length > itemsPerPage && (
            <div className="mt-12 flex items-center justify-between">
              <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredSightings.length)} of {filteredSightings.length.toLocaleString()} results
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
                  Page {currentPage} of {Math.ceil(filteredSightings.length / itemsPerPage)}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredSightings.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredSightings.length / itemsPerPage)}
                  className="px-6 py-3 bg-[#12151C] border border-white/10 uppercase tracking-wider hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
