import { useAPI } from '../contexts/APIContext';
import { Loader } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

export default function GlobalLoader() {
  const { loading, loadingProgress, error, statistics } = useAPI();

  if (!loading && !error) return null;

  if (loading) {
    const progressPercent = Math.round(loadingProgress);
    
    return (
      <div className="fixed inset-0 bg-[#080A0E] z-50 flex items-center justify-center">
        <div className="text-center max-w-xl">
          <div className="relative mb-12">
            <RadialSymbol size={200} className="text-[#00F0FF] opacity-20 animate-pulse" rays={24} />
            <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-[#00F0FF] animate-spin" />
          </div>
          
          <h2 className="text-white uppercase tracking-wider mb-3" style={{ fontSize: '1.2rem', letterSpacing: '0.15em' }}>
            Loading Phenom Search
          </h2>
          
          <p className="text-white/40 text-sm mb-8">
            {progressPercent < 10 && 'Connecting to Hatch UFO Database...'}
            {progressPercent >= 10 && progressPercent < 95 && `Loading observations... ${progressPercent}%`}
            {progressPercent >= 95 && 'Finalizing data...'}
          </p>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-[#00F0FF] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stats Display */}
          {statistics && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-[#00F0FF] text-2xl mb-1">
                    {statistics.totalSightings.toLocaleString()}
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">
                    Observations
                  </div>
                </div>
                <div>
                  <div className="text-[#00F0FF] text-2xl mb-1">
                    {statistics.dateRange.minYear} - {statistics.dateRange.maxYear}
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">
                    Time Span
                  </div>
                </div>
                <div>
                  <div className="text-[#00F0FF] text-2xl mb-1">
                    {statistics.topCountries.length}+
                  </div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">
                    Countries
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Animated Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-[#080A0E] z-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 mx-auto flex items-center justify-center">
              <span className="text-red-500 text-4xl">!</span>
            </div>
          </div>
          
          <h2 className="text-white uppercase tracking-wider mb-4" style={{ fontSize: '1.2rem', letterSpacing: '0.15em' }}>
            Connection Error
          </h2>
          
          <p className="text-white/60 mb-8">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#00F0FF] text-[#080A0E] uppercase tracking-wider hover:bg-[#00F0FF]/80 transition-colors"
            style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return null;
}
