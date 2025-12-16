import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'cyan' | 'white' | 'green' | 'red';
  className?: string;
}

export default function StatsCard({ 
  value, 
  label, 
  icon: Icon,
  trend,
  trendValue,
  color = 'cyan',
  className = ''
}: StatsCardProps) {
  const colorClasses = {
    cyan: 'text-[#00F0FF]',
    white: 'text-white',
    green: 'text-green-500',
    red: 'text-red-500'
  };

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-white/40'
  };

  return (
    <div className={`bg-white/5 border border-white/10 p-8 ${className}`}>
      {Icon && (
        <div className="mb-4">
          <Icon className="w-8 h-8 text-white/20" strokeWidth={1.5} />
        </div>
      )}
      
      <div className="flex items-baseline gap-3 mb-2">
        <div className={`${colorClasses[color]}`} style={{ fontSize: '3rem', lineHeight: '1' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        {trend && trendValue && (
          <div className={`${trendColors[trend]} uppercase tracking-wider`} style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
          </div>
        )}
      </div>
      
      <div className="text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  );
}
