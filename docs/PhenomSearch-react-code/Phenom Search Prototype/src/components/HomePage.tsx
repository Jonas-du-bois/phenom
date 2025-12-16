import { Link } from 'react-router-dom';
import { useAPI } from '../contexts/APIContext';
import Header from './Header';
import LoadingState from './LoadingState';
import Footer from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { collections } from './collectionsData';
import RadialSymbol from './RadialSymbol';

export default function HomePage() {
  const { sightings, loading } = useAPI();
  
  // Calculate real counts for featured collections
  const getFeaturedCollections = () => {
    return collections.slice(0, 3).map(collection => {
      let count = 0;

      switch (collection.id) {
        case 'high-credibility':
          count = sightings.filter(s => s.credibility >= 10).length;
          break;
        case 'military':
          count = sightings.filter(s => 
            s.witnessType.some(wt => ['MIL', 'HQO'].includes(wt))
          ).length;
          break;
        case 'physical-traces':
          count = sightings.filter(s => 
            s.phenomena.some(p => ['TRC', 'DRT', 'VEG', 'LND'].includes(p))
          ).length;
          break;
        default:
          count = collection.count;
      }

      return { ...collection, count };
    });
  };

  const featuredCollections = getFeaturedCollections();

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header />
      
      {/* Hero Section */}
      <div className="relative px-20 py-32 pt-40 min-h-screen flex items-center justify-center">
        <div className="absolute top-32 right-32">
          <RadialSymbol size={300} className="text-white opacity-20" />
        </div>
        
        <div className="max-w-[900px] relative z-10">
          <h1 className="mb-8 tracking-tight" style={{ fontSize: '8.5rem', lineHeight: '0.95', fontWeight: '400', letterSpacing: '-0.02em' }}>
            Phenom<br />
            Search
          </h1>
          <p className="text-white/50 uppercase tracking-wider mb-12" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
            Find the impossible
          </p>

          {/* Live Stats */}
          {!loading && sightings.length > 0 && (
            <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
              <div>
                <div className="text-[#00F0FF] mb-2" style={{ fontSize: '3rem', lineHeight: '1' }}>
                  {sightings.length.toLocaleString()}
                </div>
                <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  UFO Observations
                </div>
              </div>
              <div>
                <div className="text-[#00F0FF] mb-2" style={{ fontSize: '3rem', lineHeight: '1' }}>
                  {new Set(sightings.map(s => s.country)).size}
                </div>
                <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Countries
                </div>
              </div>
              <div>
                <div className="text-[#00F0FF] mb-2" style={{ fontSize: '3rem', lineHeight: '1' }}>
                  {sightings.filter(s => s.latLon !== null).length.toLocaleString()}
                </div>
                <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Geocoded Sites
                </div>
              </div>
            </div>
          )}
        </div>
        
        
      </div>

      {/* Featured Collections */}
      <div className="px-20 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="mb-16 uppercase tracking-wider text-white/60" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
            Featured Collections
          </h2>
          
          <div className="grid grid-cols-3 gap-8">
            {featuredCollections.map((collection) => {
              const Icon = collection.icon;
              return (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.id}`}
                  className="group"
                >
                  <div className="bg-white/5 border border-white/10 overflow-hidden h-[500px] flex flex-col transition-all hover:bg-white/10 hover:border-white/20">
                    <div className="h-[300px] w-full overflow-hidden bg-black relative">
                      <ImageWithFallback
                        src={collection.imageUrl}
                        alt={collection.title}
                        className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-6 right-6">
                        <RadialSymbol size={60} className="text-white opacity-40" rays={16} />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between p-10">
                      <div>
                        <h3 className="mb-3 tracking-tight uppercase" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
                          {collection.title}
                        </h3>
                        <p className="text-white/50" style={{ lineHeight: '1.5', fontSize: '0.9rem' }}>
                          {collection.description}
                        </p>
                      </div>
                      <div className="text-white/30 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                        {collection.count} cases
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 flex justify-center">
            <Link
              to="/collections"
              className="group inline-flex items-center gap-4 px-12 py-5 border border-[#00F0FF]/30 bg-[#00F0FF]/5 transition-all hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50"
            >
              <span className="uppercase tracking-wider text-[#00F0FF]" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                View All Collections
              </span>
              <svg 
                className="w-5 h-5 text-[#00F0FF] transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
