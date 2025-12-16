import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import RadialSymbol from './RadialSymbol';
import Header from './Header';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header />
      
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-8">
        {/* Background decoration */}
        <div className="absolute top-1/4 left-1/4 opacity-5">
          <RadialSymbol size={800} className="text-white" rays={32} />
        </div>

        <div className="relative z-10 text-center max-w-2xl">
          {/* 404 Number */}
          <div className="mb-12">
            <div className="text-white/10 tracking-tight" style={{ fontSize: '12rem', lineHeight: '0.9', fontWeight: '300', letterSpacing: '-0.05em' }}>
              404
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-6 tracking-tight uppercase" style={{ fontSize: '2rem', letterSpacing: '0.05em' }}>
            Page Not Found
          </h1>

          {/* Message */}
          <p className="text-white/60 mb-12 max-w-lg mx-auto" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
            The page you're looking for doesn't exist or has been moved. Like many UFO sightings, it seems to have vanished without a trace.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#00F0FF] text-black hover:bg-[#00D0DF] transition-all uppercase tracking-wider"
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              <Home size={18} />
              Go Home
            </Link>
            
            <Link
              to="/browse"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider"
              style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
            >
              <Search size={18} />
              Browse Observations
            </Link>
          </div>

          {/* Suggestions */}
          <div className="mt-16 pt-16 border-t border-white/10">
            <p className="text-white/40 mb-6 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
              Try These Instead
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/collections"
                className="text-white/60 hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                Collections
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/timeline"
                className="text-white/60 hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                Timeline
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/map"
                className="text-white/60 hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                Map
              </Link>
              <span className="text-white/20">•</span>
              <Link
                to="/stats"
                className="text-white/60 hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
                style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
              >
                Statistics
              </Link>
            </div>
          </div>

          {/* Error Code */}
          <p className="mt-16 text-white/20 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
            Error Code: 404 • Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
}
