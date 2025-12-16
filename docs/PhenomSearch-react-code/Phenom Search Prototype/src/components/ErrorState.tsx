import { AlertCircle, RefreshCw } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

interface ErrorStateProps {
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorState({ 
  title = 'Connection Error',
  message = 'Unable to load data from Phenom Search API',
  details = 'Please check your connection and try again.',
  onRetry,
  showRetry = true
}: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-[#080A0E] flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/3 opacity-5">
        <RadialSymbol size={600} className="text-red-500" />
      </div>

      <div className="relative z-10 text-center max-w-md px-8">
        {/* Error icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <AlertCircle 
              className="w-20 h-20 text-red-500/80" 
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border border-red-500/30 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 tracking-tight uppercase" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
          {title}
        </h2>

        {/* Message */}
        <p className="text-white/70 mb-2" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          {message}
        </p>

        {/* Details */}
        {details && (
          <p className="text-white/40 mb-8" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            {details}
          </p>
        )}

        {/* Retry button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider"
            style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
          >
            <RefreshCw size={18} />
            Retry Connection
          </button>
        )}

        {/* API info */}
        <p className="mt-12 text-white/20 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
          Phenom Search API • phenomsearch-api.onrender.com
        </p>
      </div>
    </div>
  );
}
