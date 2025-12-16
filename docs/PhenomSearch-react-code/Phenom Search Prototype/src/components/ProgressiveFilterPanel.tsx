import { X, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAPI } from '../contexts/APIContext';

const useCaseFilters = [
  { id: 'high-credibility', label: 'High Credibility', description: 'Credibility ≥10' },
  { id: 'military', label: 'Military Cases', description: 'Military witnesses (MIL, HQO)' },
  { id: 'physical-traces', label: 'Physical Traces', description: 'Cases with material evidence (TRC, DRT, VEG, LND)' },
  { id: 'historical', label: 'Historical Cases', description: 'Before 1950' },
  { id: 'unexplainable', label: 'Unexplainable', description: 'Strangeness ≥8' }
];

interface ProgressiveFilterPanelProps {
  onClose: () => void;
  selectedUseCases: string[];
  setSelectedUseCases: (value: string[]) => void;
  selectedCountries: string[];
  setSelectedCountries: (value: string[]) => void;
  selectedLocationTypes: string[];
  setSelectedLocationTypes: (value: string[]) => void;
  selectedWitnessTypes: string[];
  setSelectedWitnessTypes: (value: string[]) => void;
  selectedShapes: string[];
  setSelectedShapes: (value: string[]) => void;
  selectedPhenomena: string[];
  setSelectedPhenomena: (value: string[]) => void;
  yearRange: [number, number];
  setYearRange: (value: [number, number]) => void;
  credibilityRange: [number, number];
  setCredibilityRange: (value: [number, number]) => void;
  strangenessRange: [number, number];
  setStrangenessRange: (value: [number, number]) => void;
}

export default function ProgressiveFilterPanel({
  onClose,
  selectedUseCases,
  setSelectedUseCases,
  selectedCountries,
  setSelectedCountries,
  selectedLocationTypes,
  setSelectedLocationTypes,
  selectedWitnessTypes,
  setSelectedWitnessTypes,
  selectedShapes,
  setSelectedShapes,
  selectedPhenomena,
  setSelectedPhenomena,
  yearRange,
  setYearRange,
  credibilityRange,
  setCredibilityRange,
  strangenessRange,
  setStrangenessRange,
}: ProgressiveFilterPanelProps) {
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const { metadata } = useAPI();

  // Generate dynamic lists from metadata with descriptions
  const countries = useMemo(() => {
    return metadata.countries.map(c => c.name).sort();
  }, [metadata]);

  const locationTypes = useMemo(() => {
    return metadata.locationTypes.map(lt => lt.name).sort();
  }, [metadata]);

  const observerTypesData = useMemo(() => {
    return metadata.witnessTypes.sort((a, b) => a.name.localeCompare(b.name));
  }, [metadata]);

  const morphologyTypesData = useMemo(() => {
    return metadata.shapes.sort((a, b) => a.name.localeCompare(b.name));
  }, [metadata]);

  const phenomenaTypesData = useMemo(() => {
    return metadata.phenomena.sort((a, b) => a.name.localeCompare(b.name));
  }, [metadata]);

  const toggleUseCase = (id: string) => {
    setSelectedUseCases(
      selectedUseCases.includes(id) 
        ? selectedUseCases.filter(f => f !== id) 
        : [...selectedUseCases, id]
    );
  };

  const toggleArrayFilter = (array: string[], setter: (value: string[]) => void, item: string) => {
    setter(
      array.includes(item) 
        ? array.filter(f => f !== item) 
        : [...array, item]
    );
  };

  const clearAll = () => {
    setSelectedUseCases([]);
    setSelectedCountries([]);
    setSelectedLocationTypes([]);
    setSelectedWitnessTypes([]);
    setSelectedShapes([]);
    setSelectedPhenomena([]);
    setYearRange([840, 2025]);
    setCredibilityRange([0, 15]);
    setStrangenessRange([0, 10]);
  };

  const advancedFilterCount = 
    selectedCountries.length + 
    selectedLocationTypes.length + 
    selectedWitnessTypes.length + 
    selectedShapes.length + 
    selectedPhenomena.length;

  const hasActiveFilters = selectedUseCases.length > 0 || advancedFilterCount > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h2 className="uppercase tracking-wider text-white mb-1" style={{ fontSize: '1.25rem', letterSpacing: '0.15em' }}>
            Filters
          </h2>
          <p className="text-white/40 text-sm">
            {hasActiveFilters ? `${selectedUseCases.length + advancedFilterCount} active filters` : 'No active filters'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content - No scroll */}
      <div className="flex-1 flex flex-col">
        {/* Use Cases Section - Always Visible */}
        <div className="flex-1">
          <div className="mb-4">
            <h3 className="uppercase tracking-wider text-white/90 mb-1" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
              Ready-to-Use Cases
            </h3>
            <p className="text-white/40 text-xs">
              Pre-configured filters for common searches
            </p>
          </div>
          
          <div className="space-y-2.5">
            {useCaseFilters.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => toggleUseCase(useCase.id)}
                className={`w-full text-left p-4 border transition-all ${
                  selectedUseCases.includes(useCase.id)
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF] shadow-lg'
                    : 'border-white/10 hover:border-white/30 bg-[#12151C]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className={`font-medium mb-0.5 ${selectedUseCases.includes(useCase.id) ? 'text-[#00F0FF]' : 'text-white'}`} style={{ fontSize: '0.95rem' }}>
                      {useCase.label}
                    </div>
                    <div className="text-white/50 text-xs">
                      {useCase.description}
                    </div>
                  </div>
                  <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedUseCases.includes(useCase.id)
                      ? 'border-[#00F0FF] bg-[#00F0FF]'
                      : 'border-white/30'
                  }`}>
                    {selectedUseCases.includes(useCase.id) && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-6 mb-6">
          <button
            onClick={() => setShowAdvancedPanel(true)}
            className="w-full flex items-center justify-between p-4 border transition-all border-white/20 hover:border-white/40 bg-[#12151C]/50 hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm uppercase tracking-wider text-white/70" style={{ letterSpacing: '0.1em' }}>
                Advanced Filters
              </div>
              {advancedFilterCount > 0 && (
                <div className="bg-[#00F0FF] text-black text-xs px-2 py-1 rounded-full font-medium">
                  {advancedFilterCount}
                </div>
              )}
            </div>
            <ChevronDown className="text-white/60 rotate-[-90deg]" size={20} />
          </button>
        </div>

        {/* Advanced Filters Panel - Slides from right */}
        <AnimatePresence>
          {showAdvancedPanel && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={() => setShowAdvancedPanel(false)}
              />
              
              {/* Advanced Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#080A0E] z-[70] overflow-y-auto border-l border-white/10"
                style={{
                  boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div>
                      <h2 className="uppercase tracking-wider text-white mb-2" style={{ fontSize: '1.25rem', letterSpacing: '0.15em' }}>
                        Advanced Filters
                      </h2>
                      <p className="text-white/40 text-sm">
                        Detailed Configuration
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAdvancedPanel(false)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Advanced Filters Content */}
                  <div className="space-y-8 pb-8">
                    {/* Dimensions Section */}
                    <div className="bg-[#12151C]/50 border border-white/10 p-6">
                      <h4 className="uppercase tracking-wider text-white/90 mb-6" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                        Dimensions
                      </h4>

                      {/* Countries */}
                      <div className="mb-8">
                        <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Countries ({countries.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                          {countries.map((country) => (
                            <label key={country} className="flex items-center space-x-2 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedCountries.includes(country)}
                                  onChange={() => toggleArrayFilter(selectedCountries, setSelectedCountries, country)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 border ${selectedCountries.includes(country) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                                {selectedCountries.includes(country) && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black" />
                                  </div>
                                )}
                              </div>
                              <span className="text-white/70 group-hover:text-white transition-colors text-sm">
                                {country}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Location Types */}
                      <div className="mb-8">
                        <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Location Types ({locationTypes.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {locationTypes.map((type) => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={selectedLocationTypes.includes(type)}
                                  onChange={() => toggleArrayFilter(selectedLocationTypes, setSelectedLocationTypes, type)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 border ${selectedLocationTypes.includes(type) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                                {selectedLocationTypes.includes(type) && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-black" />
                                  </div>
                                )}
                              </div>
                              <span className="text-white/70 group-hover:text-white transition-colors text-sm">
                                {type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Time Period */}
                      <div className="mb-8">
                        <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Time Period ({yearRange[0]} - {yearRange[1]})
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="840"
                              max="2025"
                              value={yearRange[0]}
                              onChange={(e) => setYearRange([parseInt(e.target.value), yearRange[1]])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                            <input
                              type="range"
                              min="840"
                              max="2025"
                              value={yearRange[1]}
                              onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value)])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                          </div>
                          <div className="flex items-center justify-between text-white/50 text-sm">
                            <span>From: {yearRange[0]}</span>
                            <span>To: {yearRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Credibility */}
                      <div className="mb-8">
                        <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Credibility ({credibilityRange[0]} - {credibilityRange[1]})
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={credibilityRange[0]}
                              onChange={(e) => setCredibilityRange([parseInt(e.target.value), credibilityRange[1]])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                            <input
                              type="range"
                              min="0"
                              max="15"
                              value={credibilityRange[1]}
                              onChange={(e) => setCredibilityRange([credibilityRange[0], parseInt(e.target.value)])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                          </div>
                          <div className="flex items-center justify-between text-white/50 text-sm">
                            <span>Min: {credibilityRange[0]}</span>
                            <span>Max: {credibilityRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Strangeness */}
                      <div>
                        <label className="block text-white/50 mb-3 uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                          Strangeness ({strangenessRange[0]} - {strangenessRange[1]})
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={strangenessRange[0]}
                              onChange={(e) => setStrangenessRange([parseInt(e.target.value), strangenessRange[1]])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={strangenessRange[1]}
                              onChange={(e) => setStrangenessRange([strangenessRange[0], parseInt(e.target.value)])}
                              className="flex-1 accent-[#00F0FF]"
                            />
                          </div>
                          <div className="flex items-center justify-between text-white/50 text-sm">
                            <span>Min: {strangenessRange[0]}</span>
                            <span>Max: {strangenessRange[1]}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observers */}
                    <div className="bg-[#12151C]/50 border border-white/10 p-6">
                      <h4 className="uppercase tracking-wider text-white/90 mb-4" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                        Observers
                      </h4>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                        {observerTypesData.map((type) => (
                          <label key={type.name} className="flex items-start space-x-2 cursor-pointer group">
                            <div className="relative mt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedWitnessTypes.includes(type.name)}
                                onChange={() => toggleArrayFilter(selectedWitnessTypes, setSelectedWitnessTypes, type.name)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 border ${selectedWitnessTypes.includes(type.name) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                              {selectedWitnessTypes.includes(type.name) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-black" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-white/70 group-hover:text-white transition-colors text-sm">
                                {type.name}
                              </div>
                              {type.description && (
                                <div className="text-white/40 text-xs mt-0.5">
                                  {type.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Morphology */}
                    <div className="bg-[#12151C]/50 border border-white/10 p-6">
                      <h4 className="uppercase tracking-wider text-white/90 mb-4" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                        UFO Morphology
                      </h4>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                        {morphologyTypesData.map((type) => (
                          <label key={type.name} className="flex items-start space-x-2 cursor-pointer group">
                            <div className="relative mt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedShapes.includes(type.name)}
                                onChange={() => toggleArrayFilter(selectedShapes, setSelectedShapes, type.name)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 border ${selectedShapes.includes(type.name) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                              {selectedShapes.includes(type.name) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-black" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-white/70 group-hover:text-white transition-colors text-sm">
                                {type.name}
                              </div>
                              {type.description && (
                                <div className="text-white/40 text-xs mt-0.5">
                                  {type.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Associated Phenomena */}
                    <div className="bg-[#12151C]/50 border border-white/10 p-6">
                      <h4 className="uppercase tracking-wider text-white/90 mb-4" style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}>
                        Associated Phenomena
                      </h4>
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                        {phenomenaTypesData.map((type) => (
                          <label key={type.name} className="flex items-start space-x-2 cursor-pointer group">
                            <div className="relative mt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedPhenomena.includes(type.name)}
                                onChange={() => toggleArrayFilter(selectedPhenomena, setSelectedPhenomena, type.name)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 border ${selectedPhenomena.includes(type.name) ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-white/20 group-hover:border-white/40'} transition-colors`} />
                              {selectedPhenomena.includes(type.name) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-2 h-2 bg-black" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-white/70 group-hover:text-white transition-colors text-sm">
                                {type.name}
                              </div>
                              {type.description && (
                                <div className="text-white/40 text-xs mt-0.5">
                                  {type.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Apply Button */}
                  <div className="sticky bottom-0 pt-6 pb-4 bg-[#080A0E] border-t border-white/10">
                    <button 
                      onClick={() => setShowAdvancedPanel(false)}
                      className="w-full bg-[#00F0FF] text-black py-4 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors font-medium"
                      style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="w-full py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all uppercase tracking-wider text-sm"
              style={{ letterSpacing: '0.1em' }}
            >
              Reset All
            </button>
          )}
          <button 
            onClick={onClose}
            className="w-full bg-[#00F0FF] text-black py-3.5 uppercase tracking-wider hover:bg-[#00F0FF]/90 transition-colors font-medium"
            style={{ fontSize: '0.875rem', letterSpacing: '0.15em' }}
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}
