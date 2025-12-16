import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useAPI, type Sighting } from '../contexts/APIContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import CircularGauge from './CircularGauge';
import Header from './Header';
import RadialSymbol from './RadialSymbol';
import LoadingState from './LoadingState';
import { collections } from './collectionsData';

export default function ObservationDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { sightings: mockSightings, loading } = useAPI();
  const sighting = mockSightings.find((s) => s.id === id);

  // Determine where to go back to
  const getBackToPath = (): string => {
    // Check if there's a from parameter in the location state
    if (location.state?.from) {
      return location.state.from;
    }
    
    // Check URL query params for collectionId
    const searchParams = new URLSearchParams(location.search);
    const collectionId = searchParams.get('from');
    if (collectionId) {
      return `/collections/${collectionId}`;
    }
    
    // Default to browse page
    return '/browse';
  };

  const backToPath = getBackToPath();

  if (loading) {
    return <LoadingState message="Loading observation details..." />;
  }

  if (!sighting) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <p>Observation not found</p>
      </div>
    );
  }

  // Find similar observations based on shared attributes - optimized with useMemo
  const similarObservations = useMemo((): Sighting[] => {
    if (!sighting) return [];
    
    const similarities = mockSightings
      .filter(s => s.id !== sighting.id)
      .map(s => {
        let score = 0;
        
        // Compare shapes
        const sharedShapes = s.shape.filter(shape => sighting.shape.includes(shape));
        score += sharedShapes.length * 3;
        
        // Compare phenomena
        const sharedPhenomena = s.phenomena.filter(p => sighting.phenomena.includes(p));
        score += sharedPhenomena.length * 2;
        
        // Compare witness types
        const sharedWitnesses = s.witnessType.filter(w => sighting.witnessType.includes(w));
        score += sharedWitnesses.length * 2;
        
        // Compare credibility range
        if (Math.abs(s.credibility - sighting.credibility) <= 2) {
          score += 1;
        }
        
        return { sighting: s, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.sighting);
    
    return similarities;
  }, [sighting, mockSightings]);

  // Find which collections this observation belongs to
  const getObservationCollections = (): typeof collections => {
    const belongsTo = [];
    
    // High credibility
    if (sighting.credibility >= 11) {
      belongsTo.push(collections.find(c => c.id === 'high-credibility'));
    }
    
    // Physical traces
    if (sighting.phenomena.some(p => ['TRC', 'DRT', 'VEG', 'LND'].includes(p))) {
      belongsTo.push(collections.find(c => c.id === 'physical-traces'));
    }
    
    // Military witnesses
    if (sighting.witnessType.some(wt => ['MIL', 'HQO'].includes(wt))) {
      belongsTo.push(collections.find(c => c.id === 'military'));
    }
    
    // Shape: Disc
    if (sighting.shape.includes('DSC') || sighting.shape.includes('SPH')) {
      belongsTo.push(collections.find(c => c.id === 'shape-disc'));
    }
    
    // Shape: Triangle
    if (sighting.shape.includes('TRI') || sighting.shape.includes('DLT')) {
      belongsTo.push(collections.find(c => c.id === 'shape-triangle'));
    }
    
    // Government investigations
    if (sighting.phenomena.includes('GOV')) {
      belongsTo.push(collections.find(c => c.id === 'government-investigations'));
    }
    
    // Historical cases
    const year = parseInt(sighting.date.split('-')[0]);
    if (year < 1970) {
      belongsTo.push(collections.find(c => c.id === 'historical'));
    }
    
    // Close encounters
    if (sighting.phenomena.some(p => ['ENT', 'HUM'].includes(p))) {
      belongsTo.push(collections.find(c => c.id === 'close-encounters'));
    }
    
    return belongsTo.filter(Boolean);
  };

  const observationCollections = getObservationCollections();

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header showBack backLabel="Back to List" backTo={backToPath} />
      
      {/* Map Header */}
      <div className="relative h-[400px] w-full overflow-hidden" style={{ marginTop: '73px' }}>
        <ImageWithFallback
          src={sighting.imageUrl}
          alt={sighting.location}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
        
        <div className="absolute top-8 right-20">
          <RadialSymbol size={120} className="text-white opacity-30" rays={24} />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end px-20 pb-12">
          <h1 className="tracking-tight lowercase mb-2" style={{ fontSize: '3.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
            {sighting.location}
          </h1>
          <p className="text-white/50 uppercase tracking-wider" style={{ fontSize: '0.875rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            {sighting.date} @ {sighting.time}
          </p>
        </div>
      </div>

      {/* Data Grid */}
      <div className="px-20 py-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-[1fr_2fr] gap-20">
            {/* Left Column - Metrics */}
            <div className="space-y-8">
              {/* Gauges */}
              <div className="bg-white/5 border border-white/10 p-10">
                <div className="mb-10">
                  <CircularGauge 
                    value={sighting.credibility} 
                    max={15} 
                    label="Credibility"
                  />
                </div>
                <div>
                  <CircularGauge 
                    value={sighting.strangeness} 
                    max={10} 
                    label="Strangeness"
                  />
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-white/5 border border-white/10 p-10">
                <div className="space-y-5" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  <div>
                    <div className="text-white/40 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>Duration:</div>
                    <div className="text-white">{sighting.duration} min</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>Elevation:</div>
                    <div className="text-white">{sighting.elevation}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>Coords:</div>
                    <div className="text-white">{sighting.coords}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>Source ID:</div>
                    <div className="text-white">{sighting.sourceId}</div>
                  </div>
                </div>
              </div>

              {/* Collections */}
              {observationCollections.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-10">
                  <h3 className="mb-5 tracking-tight uppercase" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                    Found in Collections
                  </h3>
                  <div className="space-y-3">
                    {observationCollections.map((collection) => {
                      const Icon = collection.icon;
                      return (
                        <Link
                          key={collection.id}
                          to={`/collections/${collection.id}`}
                          className="flex items-center gap-3 text-[#00F0FF] hover:text-[#00F0FF]/70 transition-colors"
                        >
                          <Icon size={16} />
                          <span className="uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                            {collection.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Narrative */}
            <div className="space-y-8">
              {/* Summary Box */}
              <div className="bg-white/5 border-l-2 border-white p-12">
                <h2 className="mb-5 tracking-tight uppercase" style={{ fontSize: '1.125rem', letterSpacing: '0.05em' }}>
                  Brief Description
                </h2>
                <p className="text-white/70" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {sighting.hatchDesc}
                </p>
              </div>

              {/* Main Story */}
              <div className="bg-white/5 border border-white/10 p-12">
                <h2 className="mb-6 tracking-tight uppercase" style={{ fontSize: '1.125rem', letterSpacing: '0.05em' }}>
                  Full Account
                </h2>
                <div className="text-white/70 space-y-5" style={{ lineHeight: '1.7', fontSize: '0.95rem' }}>
                  {sighting.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="mb-4 text-white/40 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
                  Attributes
                </h3>
                <div className="flex flex-wrap gap-3">
                  {sighting.attributes.map((attr, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-white/5 border border-white/20 uppercase tracking-wider"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-8 border-t border-white/10 flex justify-between items-center text-white/40" style={{ fontSize: '0.75rem' }}>
                <div>
                  <span className="text-white/30 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Reference: </span>
                  {sighting.reference}
                </div>
                <div>
                  <span className="text-white/30 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>Source: </span>
                  {sighting.source}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Observations */}
          {similarObservations.length > 0 && (
            <div className="mt-32">
              <div className="flex items-center justify-between mb-12">
                <h2 className="tracking-tight lowercase" style={{ fontSize: '2.5rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                  Similar Observations
                </h2>
                <RadialSymbol size={80} className="text-white opacity-10" rays={16} />
              </div>

              <div className="grid grid-cols-4 gap-6">
                {similarObservations.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/observation/${similar.id}`}
                    className="group bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="h-[160px] overflow-hidden bg-black">
                      <ImageWithFallback
                        src={similar.imageUrl}
                        alt={similar.location}
                        className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 tracking-tight uppercase" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                        {similar.location}
                      </h3>
                      <p className="text-white/40 uppercase tracking-wider mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        {similar.date}
                      </p>
                      <div className="flex gap-2">
                        <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                          C: {similar.credibility}
                        </div>
                        <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                          S: {similar.strangeness}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
