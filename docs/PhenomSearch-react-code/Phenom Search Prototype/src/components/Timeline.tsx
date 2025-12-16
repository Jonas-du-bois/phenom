import { Link } from 'react-router-dom';
import { useAPI } from '../contexts/APIContext';
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';
import LoadingState from './LoadingState';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Period {
  id: string;
  name: string;
  years: string;
  startYear: number;
  endYear: number;
  description: string;
  color: string;
}

const periods: Period[] = [
  {
    id: 'period-1',
    name: 'The Genesis Era',
    years: '1947-1960',
    startYear: 1947,
    endYear: 1960,
    description: 'The birth of modern UFO phenomenon, marked by the Roswell incident and the first wave of systematic observations.',
    color: '#00F0FF'
  },
  {
    id: 'period-2',
    name: 'Cold War Tensions',
    years: '1961-1975',
    startYear: 1961,
    endYear: 1975,
    description: 'Military encounters intensify during the Cold War, with official investigations like Project Blue Book documenting thousands of cases.',
    color: '#0099FF'
  },
  {
    id: 'period-3',
    name: 'Close Encounters',
    years: '1976-1990',
    startYear: 1976,
    endYear: 1990,
    description: 'Physical trace cases and close encounter reports surge, with multiple-witness events gaining scientific attention.',
    color: '#0066CC'
  },
  {
    id: 'period-4',
    name: 'Digital Dawn',
    years: '1991-2005',
    startYear: 1991,
    endYear: 2005,
    description: 'The emergence of digital documentation transforms evidence collection, with video recordings and online databases proliferating.',
    color: '#0044AA'
  },
  {
    id: 'period-5',
    name: 'Modern Disclosure',
    years: '2006-2024',
    startYear: 2006,
    endYear: 2024,
    description: 'Government acknowledgment and declassification begin, with official UAP task forces and Pentagon releases changing public discourse.',
    color: '#002288'
  }
];

export default function Timeline() {
  const { sightings: mockSightings, loading } = useAPI();
  
  if (loading) {
    return <LoadingState message="Loading historical timeline..." />;
  }
  
  const getSightingsForPeriod = (period: Period) => {
    const filtered = mockSightings.filter(s => {
      // Parse year from different date formats
      let year: number | null = null;
      if (s.date.includes('/')) {
        const parts = s.date.split('/');
        year = parseInt(parts[2]) || parseInt(parts[0]);
      } else if (s.date.includes('-')) {
        year = parseInt(s.date.split('-')[0]);
      } else {
        year = parseInt(s.date.replace(/\D/g, ''));
      }
      
      return year && !isNaN(year) && year >= period.startYear && year <= period.endYear;
    });
    
    // Sort by credibility and strangeness, then take top 6
    return filtered
      .sort((a, b) => (b.credibility + b.strangeness) - (a.credibility + a.strangeness))
      .slice(0, 6);
  };

  const getCountForPeriod = (period: Period) => {
    return mockSightings.filter(s => {
      let year: number | null = null;
      if (s.date.includes('/')) {
        const parts = s.date.split('/');
        year = parseInt(parts[2]) || parseInt(parts[0]);
      } else if (s.date.includes('-')) {
        year = parseInt(s.date.split('-')[0]);
      } else {
        year = parseInt(s.date.replace(/\D/g, ''));
      }
      return year && !isNaN(year) && year >= period.startYear && year <= period.endYear;
    }).length;
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header />
      
      <div className="pt-[73px] px-20 py-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="mb-20 flex items-start justify-between">
            <div>
              <h1 className="tracking-tight lowercase mb-4" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                Historical Timeline
              </h1>
              <p className="text-white/50 max-w-2xl" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                Explore five decades of documented UFO observations, organized chronologically to reveal patterns and evolution of the phenomenon.
              </p>
            </div>
            <RadialSymbol size={120} className="text-white opacity-10" rays={24} />
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[60px] top-0 bottom-0 w-px bg-gradient-to-b from-[#00F0FF] via-[#0066CC] to-[#002288]" />

            {/* Periods */}
            <div className="space-y-32">
              {periods.map((period, index) => {
                const sightings = getSightingsForPeriod(period);
                
                return (
                  <div key={period.id} className="relative">
                    {/* Period Marker */}
                    <div className="absolute left-0 top-0">
                      <div 
                        className="w-[120px] h-[120px] rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: period.color, backgroundColor: 'rgba(0,0,0,0.8)' }}
                      >
                        <div className="text-center">
                          <div className="uppercase tracking-wider" style={{ fontSize: '0.65rem', color: period.color }}>
                            Period {index + 1}
                          </div>
                          <div className="mt-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: period.color }}>
                            {period.years}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Period Content */}
                    <div className="ml-[180px]">
                      <div className="mb-10">
                        <h2 
                          className="tracking-tight mb-3" 
                          style={{ fontSize: '2.5rem', fontWeight: '400', letterSpacing: '-0.01em', color: period.color }}
                        >
                          {period.name}
                        </h2>
                        <p className="text-white/60 max-w-3xl mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.7' }}>
                          {period.description}
                        </p>
                        <p className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          {getCountForPeriod(period).toLocaleString()} documented observations • Showing top 6
                        </p>
                      </div>

                      {/* Observations Grid */}
                      {sightings.length > 0 ? (
                        <div className="grid grid-cols-3 gap-6">
                          {sightings.map((sighting) => (
                            <Link
                              key={sighting.id}
                              to={`/observation/${sighting.id}`}
                              state={{ from: '/timeline' }}
                              className="group bg-[#12151C] border border-white/10 overflow-hidden transition-all hover:bg-white/5 hover:border-white/20"
                            >
                              <div className="h-[140px] overflow-hidden bg-black relative">
                                <ImageWithFallback
                                  src={sighting.imageUrl}
                                  alt={sighting.location}
                                  className="w-full h-full object-cover opacity-50 transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 right-3">
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: period.color }}
                                  />
                                </div>
                              </div>
                              <div className="p-5">
                                <div className="flex items-baseline justify-between mb-2">
                                  <h3 className="tracking-tight uppercase flex-1 truncate" style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                                    {sighting.location}
                                  </h3>
                                </div>
                                <p className="text-white/40 uppercase tracking-wider mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                                  {sighting.date}
                                </p>
                                <div className="flex gap-2">
                                  <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                                    C: {sighting.credibility}
                                  </div>
                                  <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                                    S: {sighting.strangeness}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#12151C] border border-white/10 p-10 text-white/40 text-center">
                          No documented observations for this period
                        </div>
                      )}

                      {/* Stats */}
                      <div className="mt-6 flex gap-8">
                        <div className="px-6 py-3 bg-white/5 border border-white/10">
                          <span className="text-white/40 uppercase tracking-wider mr-3" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            Total Cases:
                          </span>
                          <span style={{ fontSize: '0.875rem', color: period.color }}>
                            {mockSightings.filter(s => {
                              const year = parseInt(s.date.split('-')[0]);
                              return year >= period.startYear && year <= period.endYear;
                            }).length}
                          </span>
                        </div>
                        <div className="px-6 py-3 bg-white/5 border border-white/10">
                          <span className="text-white/40 uppercase tracking-wider mr-3" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            Duration:
                          </span>
                          <span style={{ fontSize: '0.875rem', color: period.color }}>
                            {period.endYear - period.startYear + 1} years
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
