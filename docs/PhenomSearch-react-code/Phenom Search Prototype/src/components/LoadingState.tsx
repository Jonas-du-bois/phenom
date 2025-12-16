import { Loader } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

interface LoadingStateProps {
  message?: string;
  showProgress?: boolean;
  current?: number;
  total?: number;
}

export default function LoadingState({ 
  message = 'Loading observations...', 
  showProgress = false,
  current = 0,
  total = 0
}: LoadingStateProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080A0E] flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 opacity-10">
        <RadialSymbol size={400} className="text-[#00F0FF]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Animated loader */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Loader 
              className="w-16 h-16 text-[#00F0FF] animate-spin" 
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border border-[#00F0FF]/30 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-white/90 mb-2" style={{ fontSize: '1.125rem', lineHeight: '1.6' }}>
            {message}
          </p>
          {showProgress && total > 0 && (
            <p className="text-[#00F0FF]/70 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              {current.toLocaleString()} / {total.toLocaleString()} ({percentage}%)
            </p>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && total > 0 && (
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F0FF]/50 to-[#00F0FF] transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        {/* Subtle hint */}
        <p className="mt-8 text-white/30 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
          Phenom Search
        </p>
      </div>
    </div>
  );
}
