import { Link } from 'react-router-dom';
import { Database, Github, Mail } from 'lucide-react';
import RadialSymbol from './RadialSymbol';

export default function Footer() {
  return (
    <footer className="bg-[#000000] border-t border-white/10 text-white mt-32">
      <div className="px-20 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <RadialSymbol size={40} className="text-[#00F0FF]" rays={12} />
                <h3 className="tracking-tight uppercase" style={{ fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                  Phenom Search
                </h3>
              </div>
              <p className="text-white/40 mb-4" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                A comprehensive database for exploring historical UFO observations with scientific rigor.
              </p>
              <div className="flex items-center gap-2 text-[#00F0FF]">
                <Database size={16} />
                <span className="text-xs uppercase tracking-wider">18,000+ Observations</span>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="mb-4 uppercase tracking-wider text-white/70" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/browse" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Browse Observations
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Collections
                  </Link>
                </li>
                <li>
                  <Link to="/timeline" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Timeline
                  </Link>
                </li>
                <li>
                  <Link to="/map" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Geographic Map
                  </Link>
                </li>
                <li>
                  <Link to="/stats" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Statistics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 uppercase tracking-wider text-white/70" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                Resources
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    About Project
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Help & Guide
                  </Link>
                </li>
                <li>
                  <Link to="/data-export" className="text-white/50 hover:text-[#00F0FF] transition-colors" style={{ fontSize: '0.875rem' }}>
                    Data Export Guide
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://phenomsearch-api.onrender.com/api-docs/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-[#00F0FF] transition-colors" 
                    style={{ fontSize: '0.875rem' }}
                  >
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* API Info */}
            <div>
              <h4 className="mb-4 uppercase tracking-wider text-white/70" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
                API Access
              </h4>
              <p className="text-white/40 mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                Programmatic access to all observation data via RESTful API.
              </p>
              <code className="block bg-white/5 border border-white/10 px-3 py-2 text-[#00F0FF] mb-4" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                phenomsearch-api.onrender.com
              </code>
              <a 
                href="https://phenomsearch-api.onrender.com/api-docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
                style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
              >
                View Docs →
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <p className="text-white/30 uppercase tracking-wider" style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}>
              © 2024 Phenom Search • Research Prototype
            </p>
            <div className="flex items-center gap-6">
              <span className="text-white/20 uppercase tracking-wider" style={{ fontSize: '0.65rem', letterSpacing: '0.15em' }}>
                Built with Figma Make
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
