import { Link } from 'react-router-dom';
import { useAPI } from '../contexts/APIContext';
import Header from './Header';
import LoadingState from './LoadingState';
import Footer from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { collections } from './collectionsData';
import RadialSymbol from './RadialSymbol';

export default function CollectionsHub() {
  const { sightings, loading } = useAPI();

  // Calculate real counts for each collection
  const collectionsWithCounts = collections.map(collection => {
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
      case 'historical':
        count = sightings.filter(s => {
          const year = parseInt(s.date.split(/[-/]/)[0]);
          return !isNaN(year) && year < 1950;
        }).length;
        break;
      case 'unexplainable':
        count = sightings.filter(s => s.strangeness >= 8).length;
        break;
      case 'photographic':
        count = sightings.filter(s => s.phenomena.includes('PHT')).length;
        break;
      default:
        count = collection.count;
    }

    return { ...collection, count };
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Header showBack backTo="/" backLabel="Back to Home" />
      
      <div className="px-20 py-16 pt-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h1 className="tracking-tight lowercase" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
              Browse Collections
            </h1>
            <RadialSymbol size={120} className="text-white opacity-10" rays={20} />
          </div>

          {loading ? (
            <LoadingState message="Loading collections..." />
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {collectionsWithCounts.map((collection) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.id}`}
                className="group h-full"
              >
                <div className="bg-white/5 border border-white/10 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20 h-full flex flex-col">
                  <div className="w-full overflow-hidden bg-black h-[240px] flex-shrink-0">
                    <ImageWithFallback
                      src={collection.imageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="mb-2 tracking-tight uppercase" style={{ fontSize: '1.125rem', letterSpacing: '0.05em' }}>
                      {collection.title}
                    </h3>
                    <p className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                      {collection.count} observations
                    </p>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}