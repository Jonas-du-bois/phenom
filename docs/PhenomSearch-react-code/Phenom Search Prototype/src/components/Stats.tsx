import { useAPI } from '../contexts/APIContext';
import Header from './Header';
import Footer from './Footer';
import LoadingState from './LoadingState';
import RadialSymbol from './RadialSymbol';
import StatsCard from './StatsCard';
import { Database, MapPin, Calendar, Eye, Gauge, Sparkles, Globe, Users } from 'lucide-react';

export default function Stats() {
  const { sightings, loading, statistics } = useAPI();

  if (loading) {
    return <LoadingState message="Loading statistics..." />;
  }

  // Calculate additional statistics
  const totalCountries = new Set(sightings.map(s => s.country)).size;
  const totalLocations = new Set(sightings.map(s => s.location)).size;
  const avgCredibility = (sightings.reduce((sum, s) => sum + s.credibility, 0) / sightings.length).toFixed(1);
  const avgStrangeness = (sightings.reduce((sum, s) => sum + s.strangeness, 0) / sightings.length).toFixed(1);
  
  const highCredibilityCases = sightings.filter(s => s.credibility >= 10).length;
  const highStrangenessCases = sightings.filter(s => s.strangeness >= 8).length;
  const militaryWitnesses = sightings.filter(s => s.witnessType.some(wt => ['MIL', 'HQO'].includes(wt))).length;
  const withCoordinates = sightings.filter(s => s.latLon).length;
  
  // Date range
  const years = sightings.map(s => {
    const year = parseInt(s.date.split(/[-/]/)[0]);
    return isNaN(year) ? null : year;
  }).filter(y => y !== null) as number[];
  
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const timeSpan = maxYear - minYear;

  // Top countries
  const countryCounts = sightings.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top shapes
  const shapeCounts = sightings.reduce((acc, s) => {
    s.shape.forEach(shape => {
      acc[shape] = (acc[shape] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const topShapes = Object.entries(shapeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div>
              <h1 className="tracking-tight lowercase mb-4" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                Database Statistics
              </h1>
              <p className="text-white/50 max-w-2xl" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                Comprehensive analysis of {sightings.length.toLocaleString()} UFO observations from the Phenom Search API, spanning {timeSpan} years of documented phenomena.
              </p>
            </div>
            <RadialSymbol size={120} className="text-white opacity-10" rays={20} />
          </div>

          {/* Primary Stats Grid */}
          <div className="grid grid-cols-4 gap-8 mb-16">
            <StatsCard 
              value={sightings.length}
              label="Total Observations"
              icon={Database}
              color="cyan"
            />
            <StatsCard 
              value={totalCountries}
              label="Countries"
              icon={Globe}
              color="white"
            />
            <StatsCard 
              value={totalLocations}
              label="Unique Locations"
              icon={MapPin}
              color="white"
            />
            <StatsCard 
              value={`${minYear} - ${maxYear}`}
              label="Date Range"
              icon={Calendar}
              color="white"
            />
          </div>

          {/* Quality Metrics */}
          <div className="mb-16">
            <h2 className="mb-8 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
              Quality Metrics
            </h2>
            <div className="grid grid-cols-4 gap-8">
              <StatsCard 
                value={avgCredibility}
                label="Avg. Credibility"
                icon={Gauge}
                color="cyan"
              />
              <StatsCard 
                value={avgStrangeness}
                label="Avg. Strangeness"
                icon={Sparkles}
                color="cyan"
              />
              <StatsCard 
                value={highCredibilityCases}
                label="High Credibility Cases"
                icon={Eye}
                color="green"
              />
              <StatsCard 
                value={militaryWitnesses}
                label="Military Witnesses"
                icon={Users}
                color="green"
              />
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="uppercase tracking-wider text-white/70" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  Geocoding Coverage
                </h3>
                <MapPin className="w-6 h-6 text-white/20" />
              </div>
              <div className="text-[#00F0FF] mb-2" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
                {Math.round((withCoordinates / sightings.length) * 100)}%
              </div>
              <p className="text-white/40" style={{ fontSize: '0.875rem' }}>
                {withCoordinates.toLocaleString()} of {sightings.length.toLocaleString()} observations have geographic coordinates
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="uppercase tracking-wider text-white/70" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                  High Strangeness
                </h3>
                <Sparkles className="w-6 h-6 text-white/20" />
              </div>
              <div className="text-[#00F0FF] mb-2" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
                {Math.round((highStrangenessCases / sightings.length) * 100)}%
              </div>
              <p className="text-white/40" style={{ fontSize: '0.875rem' }}>
                {highStrangenessCases.toLocaleString()} cases with strangeness rating ≥ 8
              </p>
            </div>
          </div>

          {/* Top Countries */}
          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 p-10">
              <h3 className="mb-8 uppercase tracking-wider text-white/70" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                Top 10 Countries
              </h3>
              <div className="space-y-4">
                {topCountries.map(([country, count], index) => (
                  <div key={country} className="flex items-center gap-4">
                    <div className="w-8 text-white/30 text-right" style={{ fontSize: '0.875rem' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/90" style={{ fontSize: '0.95rem' }}>{country}</span>
                        <span className="text-[#00F0FF]" style={{ fontSize: '0.875rem' }}>{count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]" 
                          style={{ width: `${(count / topCountries[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Shapes */}
            <div className="bg-white/5 border border-white/10 p-10">
              <h3 className="mb-8 uppercase tracking-wider text-white/70" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
                Top 10 UFO Shapes
              </h3>
              <div className="space-y-4">
                {topShapes.map(([shape, count], index) => (
                  <div key={shape} className="flex items-center gap-4">
                    <div className="w-8 text-white/30 text-right" style={{ fontSize: '0.875rem' }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/90" style={{ fontSize: '0.95rem' }}>{shape}</span>
                        <span className="text-[#00F0FF]" style={{ fontSize: '0.875rem' }}>{count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF]" 
                          style={{ width: `${(count / topShapes[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API Info */}
          <div className="bg-white/5 border border-white/10 p-10">
            <h3 className="mb-6 uppercase tracking-wider text-white/70" style={{ fontSize: '1rem', letterSpacing: '0.05em' }}>
              Data Source
            </h3>
            <p className="text-white/50 mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
              All statistics are calculated in real-time from the Phenom Search API, which provides access to a comprehensive database of UFO sightings with detailed metadata, geocoding, credibility ratings, and phenomenological classifications.
            </p>
            <div className="flex items-center gap-4 text-[#00F0FF] text-sm">
              <a 
                href="https://phenomsearch-api.onrender.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                API Endpoint
              </a>
              <span className="text-white/20">•</span>
              <a 
                href="https://phenomsearch-api.onrender.com/api-docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
