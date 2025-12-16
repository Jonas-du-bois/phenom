import { Search, Filter } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

interface EmptyStateProps {
  title?: string;
  message?: string;
  suggestion?: string;
  onClearFilters?: () => void;
  showClearFilters?: boolean;
  icon?: 'search' | 'filter';
}

export default function EmptyState({ 
  title = 'No Results Found',
  message = 'No observations match your current search criteria.',
  suggestion = 'Try adjusting your filters or search terms.',
  onClearFilters,
  showClearFilters = true,
  icon = 'search'
}: EmptyStateProps) {
  const IconComponent = icon === 'search' ? Search : Filter;

  return (
    <div className="py-32 text-center relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
        <RadialSymbol size={400} className="text-white" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-8">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <IconComponent 
              className="w-16 h-16 text-white/20" 
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border border-white/10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-4 tracking-tight uppercase text-white/70" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>
          {title}
        </h3>

        {/* Message */}
        <p className="text-white/50 mb-2" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          {message}
        </p>

        {/* Suggestion */}
        {suggestion && (
          <p className="text-white/30 mb-8" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            {suggestion}
          </p>
        )}

        {/* Clear filters button */}
        {showClearFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all uppercase tracking-wider"
            style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}
          >
            <Filter size={18} />
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
