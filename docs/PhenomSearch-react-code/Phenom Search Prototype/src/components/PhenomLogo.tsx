import logoImage from 'figma:asset/ef418f98e0892a71a66a7c42bd15fa4a125c8daf.png';

interface PhenomLogoProps {
  size?: 'small' | 'large';
  className?: string;
}

export default function PhenomLogo({ size = 'small', className = '' }: PhenomLogoProps) {
  const height = size === 'large' ? 'h-56' : 'h-8';
  
  return (
    <img 
      src={logoImage} 
      alt="Phenom Search" 
      className={`${height} ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}