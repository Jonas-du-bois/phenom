import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FilterSection {
  id: string;
  title: string;
  items?: string[];
  type?: 'checkbox' | 'range' | 'preset';
  ranges?: { label: string; min: number; max: number }[];
}

const filterSections: FilterSection[] = [
  {
    id: 'dimensions',
    title: 'DIMENSIONS',
    type: 'checkbox',
    items: []
  },
  {
    id: 'observers',
    title: 'OBSERVATEURS',
    type: 'checkbox',
    items: ['Civils', 'Militaires', 'Scientifiques', 'Haute qualité', 'Côtiers', 'En mer', 'Médias/Presse']
  },
  {
    id: 'morphology',
    title: 'MORPHOLOGIE OVNI',
    type: 'checkbox',
    items: ['Soucoupe', 'Cigare', 'Delta', 'Points lumineux', 'Boule de feu', 'Sonde', 'Entité seule', 'Sphère', 'Triangle', 'Cylindre']
  },
  {
    id: 'phenomena',
    title: 'PHÉNOMÈNES ASSOCIÉS',
    type: 'checkbox',
    items: ['Atterrissage', 'Submersible', 'Sons', 'Faisceaux lumineux', 'Signaux', 'Traces physiques (TRC)', 'Traces physiques (DRT)', 'Traces physiques (VEG)', 'Traces physiques (RDA)', 'Effets sur humains', 'Effets sur animaux', 'Effets sur bâtiments', 'Enquêtes gouvernementales']
  },
  {
    id: 'presets',
    title: 'CAS D\'USAGE PRÊTS À L\'EMPLOI',
    type: 'preset',
    items: ['Haute crédibilité (≥8, étrangeté ≥7)', 'Cas militaires', 'Cas avec traces physiques', 'Cas historiques (<1900)', 'Cas non-explicables (exclure MID)']
  }
];

const locationTypes = [
  'Aéroport', 'Zone rurale', 'Zone urbaine', 'Autoroute', 'Forêt', 'Montagne', 
  'Désert', 'Côte', 'Mer/Océan', 'Lac/Rivière', 'Base militaire', 'Installation nucléaire', 'Autre'
];

const countries = [
  'États-Unis', 'France', 'Royaume-Uni', 'Canada', 'Australie', 'Brésil',
  'Italie', 'Espagne', 'Allemagne', 'Russie', 'Chine', 'Japon',
  'Argentine', 'Mexique', 'Belgique', 'Pays-Bas', 'Suède', 'Norvège',
  'Chili', 'Pérou', 'Afrique du Sud', 'Nouvelle-Zélande', 'Portugal', 'Suisse', 'Autre'
];

export default function FilterPanel() {
  const [openSections, setOpenSections] = useState<string[]>(['dimensions', 'observers', 'morphology', 'phenomena', 'presets']);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [credibility, setCredibility] = useState([3, 15]);
  const [strangeness, setStrangeness] = useState([3, 10]);
  const [yearRange, setYearRange] = useState([840, 2000]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearAll = () => {
    setSelectedFilters([]);
    setCredibility([3, 15]);
    setStrangeness([3, 10]);
    setYearRange([840, 2000]);
  };

  return (
    <div className="bg-[#12151C] border border-white/10 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
        <h2 className="uppercase tracking-wider text-white/60" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
          Filtres avancés
        </h2>
        <button
          onClick={clearAll}
          className="text-[#00F0FF] hover:text-[#00F0FF]/80 uppercase tracking-wider transition-colors"
          style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
        >
          Réinitialiser
        </button>
      </div>

      {/* DIMENSIONS Section */}
      <div className="mb-8">
        <button
          onClick={() => toggleSection('dimensions')}
          className="flex items-center justify-between w-full mb-6 group"
        >
          <h3 className="uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
            Dimensions
          </h3>
          {openSections.includes('dimensions') ? (
            <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
          )}
        </button>

        {openSections.includes('dimensions') && (
          <div className="space-y-8 pl-4">
            {/* Localisation - Pays */}
            <div>
              <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Pays (25+)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {countries.map((country) => (
                  <label key={country} className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(`country-${country}`)}
                        onChange={() => toggleFilter(`country-${country}`)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border ${selectedFilters.includes(`country-${country}`) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                      {selectedFilters.includes(`country-${country}`) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-black" />
                        </div>
                      )}
                    </div>
                    <span className="text-white/70 group-hover:text-white transition-colors" style={{ fontSize: '0.875rem' }}>
                      {country}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Types de lieux */}
            <div>
              <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Types de lieux (13)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {locationTypes.map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(`location-${type}`)}
                        onChange={() => toggleFilter(`location-${type}`)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border ${selectedFilters.includes(`location-${type}`) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                      {selectedFilters.includes(`location-${type}`) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-black" />
                        </div>
                      )}
                    </div>
                    <span className="text-white/70 group-hover:text-white transition-colors" style={{ fontSize: '0.875rem' }}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Période temporelle */}
            <div>
              <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Période temporelle (840-2000+)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="840"
                  max="2025"
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                  className="w-full accent-[#00F0FF]"
                  style={{
                    background: `linear-gradient(to right, #00F0FF 0%, #00F0FF ${((yearRange[0] - 840) / (2025 - 840)) * 100}%, rgba(255,255,255,0.1) ${((yearRange[0] - 840) / (2025 - 840)) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <div className="flex items-center justify-between text-white/50" style={{ fontSize: '0.875rem' }}>
                  <span>{yearRange[0]}</span>
                  <span>{yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Qualité - Crédibilité */}
            <div>
              <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Crédibilité (3-15)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={credibility[0]}
                  onChange={(e) => setCredibility([parseInt(e.target.value), credibility[1]])}
                  className="w-full accent-[#00F0FF]"
                />
                <div className="flex items-center justify-between text-white/50" style={{ fontSize: '0.875rem' }}>
                  <span>{credibility[0]}</span>
                  <span>{credibility[1]}</span>
                </div>
              </div>
            </div>

            {/* Qualité - Étrangeté */}
            <div>
              <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Étrangeté (3-10)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={strangeness[0]}
                  onChange={(e) => setStrangeness([parseInt(e.target.value), strangeness[1]])}
                  className="w-full accent-[#00F0FF]"
                />
                <div className="flex items-center justify-between text-white/50" style={{ fontSize: '0.875rem' }}>
                  <span>{strangeness[0]}</span>
                  <span>{strangeness[1]}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Sections */}
      {filterSections.slice(1).map((section) => (
        <div key={section.id} className="mb-8">
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full mb-6 group"
          >
            <h3 className="uppercase tracking-wider" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
              {section.title}
            </h3>
            {openSections.includes(section.id) ? (
              <ChevronUp className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
            )}
          </button>

          {openSections.includes(section.id) && section.items && (
            <div className="space-y-2 pl-4">
              {section.type === 'preset' ? (
                // Preset buttons
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleFilter(`${section.id}-${item}`)}
                      className={`w-full text-left px-4 py-3 border transition-all ${
                        selectedFilters.includes(`${section.id}-${item}`)
                          ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-[#00F0FF]'
                          : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                      }`}
                      style={{ fontSize: '0.875rem' }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : (
                // Checkboxes
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <label key={item} className="flex items-center space-x-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(`${section.id}-${item}`)}
                          onChange={() => toggleFilter(`${section.id}-${item}`)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border ${selectedFilters.includes(`${section.id}-${item}`) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                        {selectedFilters.includes(`${section.id}-${item}`) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-black" />
                          </div>
                        )}
                      </div>
                      <span className="text-white/70 group-hover:text-white transition-colors" style={{ fontSize: '0.875rem' }}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Apply Button */}
      <div className="pt-8 border-t border-white/10">
        <button className="w-full bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
}
