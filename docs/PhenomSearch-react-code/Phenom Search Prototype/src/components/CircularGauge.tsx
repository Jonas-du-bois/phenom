import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
}

export default function CircularGauge({ value, max, label }: CircularGaugeProps) {
  const percentage = (value / max) * 100;
  const data = [
    { name: 'filled', value: value },
    { name: 'empty', value: max - value },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 min-w-[160px] min-h-[160px]">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#ffffff" />
              <Cell fill="#1a1a1a" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white" style={{ fontSize: '2rem', fontFamily: 'monospace', fontWeight: '300' }}>
            {value}
          </div>
          <div className="text-white/40" style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
            / {max}
          </div>
        </div>
      </div>
      <div className="mt-4 text-white/40 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  );
}