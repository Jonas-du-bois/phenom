import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Database } from 'lucide-react';
import { useAPI } from '../contexts/APIContext';
import PhenomLogo from './PhenomLogo';

interface HeaderProps {
  showBack?: boolean;
  backTo?: string;
  backLabel?: string;
}

export default function Header({ showBack = false, backTo, backLabel = 'Back' }: HeaderProps) {
  const navigate = useNavigate();
  const { sightings, loading } = useAPI();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="w-full px-20 py-6 fixed top-0 left-0 right-0 bg-[#000000] z-50 border-b border-white/10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center">
            <PhenomLogo size="small" />
          </Link>
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase tracking-wider"
              style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              <ArrowLeft size={16} />
              <span>{backLabel}</span>
            </button>
          )}
        </div>
        <nav className="flex gap-10">
          <Link 
            to="/collections" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Collections
          </Link>
          <Link 
            to="/browse" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Browse
          </Link>
          <Link 
            to="/timeline" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Timeline
          </Link>
          <Link 
            to="/map" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Map
          </Link>
          <Link 
            to="/stats" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Stats
          </Link>
          <Link 
            to="/about" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            About
          </Link>
          <Link 
            to="/help" 
            className="text-white/60 hover:text-white transition-colors uppercase tracking-wider"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Help
          </Link>
        </nav>
        
      </div>
    </header>
  );
}