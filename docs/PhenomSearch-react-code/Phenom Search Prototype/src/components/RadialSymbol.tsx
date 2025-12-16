interface RadialSymbolProps {
  size?: number;
  className?: string;
  rays?: number;
}

export default function RadialSymbol({ size = 200, className = '', rays = 24 }: RadialSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(100, 100)">
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i * 360) / rays;
          const radians = (angle * Math.PI) / 180;
          const innerRadius = 30;
          const outerRadius = 90;
          const x1 = Math.cos(radians) * innerRadius;
          const y1 = Math.sin(radians) * innerRadius;
          const x2 = Math.cos(radians) * outerRadius;
          const y2 = Math.sin(radians) * outerRadius;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}
