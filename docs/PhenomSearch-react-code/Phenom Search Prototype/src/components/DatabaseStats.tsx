import { useAPI } from '../contexts/APIContext';
import RadialSymbol from './RadialSymbol';

export default function DatabaseStats() {
  const { statistics, sightings, loading } = useAPI();

  if (loading || !statistics) {
    return (
      <div className="bg-[#12151C] border border-white/10 p-12 text-center">
        <div className="text-white/40">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-4 gap-8">
        <div className="bg-[#12151C] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
            <RadialSymbol size={80} className="text-[#00F0FF]" rays={12} />
          </div>
          <div className="text-[#00F0FF] mb-3" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {statistics.totalSightings.toLocaleString()}
          </div>
          <div className="text-white/60 uppercase tracking-wider" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            Total Observations
          </div>
        </div>

        <div className="bg-[#12151C] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
            <RadialSymbol size={80} className="text-[#00F0FF]" rays={12} />
          </div>
          <div className="text-[#00F0FF] mb-3" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {statistics.dateRange.span}
          </div>
          <div className="text-white/60 uppercase tracking-wider mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            Years Span
          </div>
          <div className="text-white/40 text-xs">
            {statistics.dateRange.minYear} - {statistics.dateRange.maxYear}
          </div>
        </div>

        <div className="bg-[#12151C] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
            <RadialSymbol size={80} className="text-[#00F0FF]" rays={12} />
          </div>
          <div className="text-[#00F0FF] mb-3" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {statistics.sightingsWithCoordinates.toLocaleString()}
          </div>
          <div className="text-white/60 uppercase tracking-wider mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            Geocoded
          </div>
          <div className="text-white/40 text-xs">
            {((statistics.sightingsWithCoordinates / statistics.totalSightings) * 100).toFixed(1)}% coverage
          </div>
        </div>

        <div className="bg-[#12151C] border border-white/10 p-8 text-center relative overflow-hidden group hover:border-[#00F0FF]/30 transition-colors">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
            <RadialSymbol size={80} className="text-[#00F0FF]" rays={12} />
          </div>
          <div className="text-[#00F0FF] mb-3" style={{ fontSize: '2.5rem', lineHeight: '1' }}>
            {statistics.topCountries.length}+
          </div>
          <div className="text-white/60 uppercase tracking-wider" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
            Countries
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#12151C] border border-white/10 p-8">
          <h3 className="text-white uppercase tracking-wider mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
            Credibility Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Minimum</span>
              <span className="text-[#00F0FF]">{statistics.credibilityStats.min}/15</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Average</span>
              <span className="text-[#00F0FF]">{statistics.credibilityStats.avg}/15</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Maximum</span>
              <span className="text-[#00F0FF]">{statistics.credibilityStats.max}/15</span>
            </div>
          </div>
        </div>

        <div className="bg-[#12151C] border border-white/10 p-8">
          <h3 className="text-white uppercase tracking-wider mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
            Strangeness Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Minimum</span>
              <span className="text-[#00F0FF]">{statistics.strangenessStats.min}/10</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Average</span>
              <span className="text-[#00F0FF]">{statistics.strangenessStats.avg}/10</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Maximum</span>
              <span className="text-[#00F0FF]">{statistics.strangenessStats.max}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-[#12151C] border border-white/10 p-8">
        <h3 className="text-white uppercase tracking-wider mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
          Top 10 Countries by Observations
        </h3>
        <div className="space-y-4">
          {statistics.topCountries.slice(0, 10).map((item, index) => {
            const percentage = (item.count / statistics.totalSightings) * 100;
            return (
              <div key={item.country}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-white/80">
                    {index + 1}. {item.country}
                  </span>
                  <span className="text-[#00F0FF]">
                    {item.count.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00F0FF]/50"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Observer Types Distribution */}
      <div className="bg-[#12151C] border border-white/10 p-8">
        <h3 className="text-white uppercase tracking-wider mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
          Observer Types Distribution
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(statistics.observerTypeDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([code, count]) => (
              <div key={code} className="text-center">
                <div className="text-[#00F0FF] mb-1" style={{ fontSize: '1.5rem' }}>
                  {count.toLocaleString()}
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wider">
                  {code}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* UFO Shapes Distribution */}
      <div className="bg-[#12151C] border border-white/10 p-8">
        <h3 className="text-white uppercase tracking-wider mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.1em' }}>
          UFO Shapes Distribution
        </h3>
        <div className="grid grid-cols-4 gap-6">
          {Object.entries(statistics.ufoShapeDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([code, count]) => (
              <div key={code} className="text-center">
                <div className="text-[#00F0FF] mb-1" style={{ fontSize: '1.5rem' }}>
                  {count.toLocaleString()}
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wider">
                  {code}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
