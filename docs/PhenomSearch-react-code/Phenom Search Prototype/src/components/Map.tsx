import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import RadialSymbol from './RadialSymbol';
import { useAPI } from '../contexts/APIContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Globe, List, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Sighting {
  id: string;
  location: string;
  country: string;
  latLon: [number, number] | null;
  [key: string]: any;
}

interface LocationGroup {
  id: string;
  location: string;
  country: string;
  coords: [number, number]; // [lat, lon]
  sightings: Sighting[];
}

type ViewMode = 'map' | 'list';

export default function Map() {
  const { sightings, loading } = useAPI();
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

  // Group sightings by location
  const getLocationGroups = (): LocationGroup[] => {
    const locationMap: { [key: string]: Sighting[] } = {};
    
    // Only process sightings with coordinates
    const sightingsWithCoords = sightings.filter(s => s.latLon !== null);
    
    sightingsWithCoords.forEach(sighting => {
      const key = sighting.location;
      if (!locationMap[key]) {
        locationMap[key] = [];
      }
      locationMap[key].push(sighting);
    });

    return Object.entries(locationMap).map(([location, sightings], index) => {
      const coords = sightings[0].latLon!;
      const country = sightings[0].country;
      
      return {
        id: `loc-${index}-${location.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30)}`,
        location,
        country,
        coords,
        sightings
      };
    });
  };

  const allLocationGroups = getLocationGroups();
  
  // Limit to 200 most significant locations for performance
  const locationGroups = allLocationGroups
    .sort((a, b) => b.sightings.length - a.sightings.length)
    .slice(0, 200);

  // Convert lat/lon to pixel coordinates using Web Mercator projection
  const coordsToPixels = (lat: number, lon: number): { x: number; y: number } => {
    if (!mapDimensions.width || !mapDimensions.height) {
      return { x: 0, y: 0 };
    }

    const width = mapDimensions.width;
    const height = mapDimensions.height;

    // Web Mercator projection
    // Longitude: -180 to 180 -> 0 to width
    const x = ((lon + 180) / 360) * width;

    // Latitude: needs Mercator transformation
    // Clamp latitude to avoid infinity at poles
    const latRad = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (height / 2) - (width * mercN) / (2 * Math.PI);

    return { x, y };
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        setMapDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Small delay to ensure image is loaded
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, [viewMode]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.5, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  return (
    <div className="min-h-screen bg-[#080A0E] text-white">
      <Header />
      
      <div className="pt-[73px] px-20 py-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="mb-12 flex items-start justify-between">
            <div>
              <h1 className="tracking-tight lowercase mb-4" style={{ fontSize: '4rem', fontWeight: '400', letterSpacing: '-0.02em' }}>
                Geographic Map
              </h1>
              <p className="text-white/50 max-w-2xl" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                Interactive visualization of UFO observations across the globe. Explore {sightings.filter(s => s.latLon).length.toLocaleString()} geocoded observations from {allLocationGroups.length.toLocaleString()} locations. Showing top {locationGroups.length} by activity.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <RadialSymbol size={120} className="text-white opacity-10" rays={24} />
              
              {/* View Toggle */}
              <div className="bg-[#12151C] border border-white/10 p-1 flex gap-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
                    viewMode === 'map' 
                      ? 'bg-[#00F0FF] text-black' 
                      : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
                >
                  <Globe size={14} />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#00F0FF] text-black' 
                      : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
                >
                  <List size={14} />
                  List
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="grid grid-cols-[2fr_1fr] gap-12">
              {/* Map Container */}
              <div className="relative">
                <div 
                  ref={mapRef}
                  className="relative w-full bg-[#0a0e14] border border-white/10 overflow-hidden select-none"
                  style={{ 
                    height: '700px', 
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {/* World Map Image */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1742415105376-43d3a5fd03fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcCUyMGdlb2dyYXBoeXxlbnwxfHx8fDE3NjQ3NDc0MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="World Map"
                      className="w-full h-full object-cover"
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  {/* Location Markers */}
                  {mapDimensions.width > 0 && locationGroups.map(location => {
                    const { x, y } = coordsToPixels(location.coords[0], location.coords[1]);
                    const isHovered = hoveredLocation === location.id;
                    const isSelected = selectedLocation?.id === location.id;
                    const baseSize = 14;
                    const size = baseSize + Math.min(location.sightings.length * 3, 20);
                    
                    // Apply zoom and pan transformations
                    const transformedX = (x * zoom) + pan.x + (mapDimensions.width * (1 - zoom) / 2);
                    const transformedY = (y * zoom) + pan.y + (mapDimensions.height * (1 - zoom) / 2);
                    
                    // Only render if within visible bounds (with margin)
                    if (transformedX < -100 || transformedX > mapDimensions.width + 100 ||
                        transformedY < -100 || transformedY > mapDimensions.height + 100) {
                      return null;
                    }

                    return (
                      <button
                        key={location.id}
                        className="absolute z-10"
                        style={{ 
                          left: `${transformedX}px`,
                          top: `${transformedY}px`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        onMouseEnter={() => setHoveredLocation(location.id)}
                        onMouseLeave={() => setHoveredLocation(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(location);
                        }}
                      >
                        {/* Outer glow ring for selected/hovered */}
                        {(isHovered || isSelected) && (
                          <div 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00F0FF] animate-ping"
                            style={{ 
                              width: `${size + 30}px`, 
                              height: `${size + 30}px`,
                              backgroundColor: 'rgba(0, 240, 255, 0.1)',
                              animationDuration: '2s'
                            }}
                          />
                        )}
                        
                        {/* Main marker */}
                        <div
                          className="rounded-full border-3 transition-all relative"
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: isSelected ? '#00F0FF' : 'rgba(0, 240, 255, 0.8)',
                            borderColor: '#000000',
                            borderWidth: '3px',
                            boxShadow: isSelected 
                              ? '0 0 30px rgba(0, 240, 255, 1), inset 0 0 10px rgba(0, 0, 0, 0.5)' 
                              : isHovered 
                                ? '0 0 20px rgba(0, 240, 255, 0.8)' 
                                : '0 0 10px rgba(0, 240, 255, 0.6)',
                          }}
                        >
                          {/* Count badge */}
                          {location.sightings.length > 1 && (
                            <div 
                              className="absolute -top-2 -right-2 bg-[#00F0FF] text-black rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center border-2 border-black"
                              style={{ fontSize: '0.7rem', fontWeight: '700' }}
                            >
                              {location.sightings.length}
                            </div>
                          )}
                        </div>

                        {/* Hover tooltip */}
                        {isHovered && (
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 border border-[#00F0FF] px-4 py-2 pointer-events-none z-20"
                            style={{ 
                              bottom: `${size + 10}px`,
                              fontSize: '0.75rem',
                              maxWidth: '200px'
                            }}
                          >
                            <div className="uppercase tracking-wider text-[#00F0FF] mb-1" style={{ letterSpacing: '0.05em', fontWeight: '600' }}>
                              {location.location}
                            </div>
                            <div className="text-white/50 text-xs">
                              {location.sightings.length} case{location.sightings.length > 1 ? 's' : ''}
                            </div>
                            <div className="text-white/40 text-xs font-mono mt-1">
                              {location.coords[0].toFixed(2)}°, {location.coords[1].toFixed(2)}°
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Zoom controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button
                      onClick={handleZoomIn}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                      title="Zoom in"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                      title="Zoom out"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                      title="Reset view"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute top-4 left-4 opacity-10 pointer-events-none z-10">
                    <RadialSymbol size={60} className="text-[#00F0FF]" rays={12} />
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none z-10">
                    <RadialSymbol size={60} className="text-[#00F0FF]" rays={12} />
                  </div>

                  {/* Info overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/90 border border-white/20 px-4 py-2.5 pointer-events-none z-20">
                    <div className="text-white/60 uppercase tracking-wider" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                      {locationGroups.length} Locations • {sightings.filter(s => s.latLon).length.toLocaleString()} Cases • Drag to pan • Scroll or buttons to zoom
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 bg-[#12151C] border border-white/10 p-6">
                  <h3 className="text-white/60 uppercase tracking-wider mb-4" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                    Map Legend
                  </h3>
                  <div className="flex gap-8 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-3 border-black" style={{ backgroundColor: 'rgba(0, 240, 255, 0.8)' }} />
                      <span className="text-white/50" style={{ fontSize: '0.8rem' }}>Single Case</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full border-3 border-black" style={{ backgroundColor: 'rgba(0, 240, 255, 0.8)' }} />
                        <div className="absolute -top-1 -right-1 bg-[#00F0FF] text-black border-2 border-black rounded-full w-5 h-5 flex items-center justify-center" style={{ fontSize: '0.6rem', fontWeight: '700' }}>5</div>
                      </div>
                      <span className="text-white/50" style={{ fontSize: '0.8rem' }}>Multiple Cases</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-3 border-black bg-[#00F0FF]" style={{ boxShadow: '0 0 15px rgba(0, 240, 255, 1)' }} />
                      <span className="text-white/50" style={{ fontSize: '0.8rem' }}>Selected</span>
                    </div>
                  </div>
                  <div className="mt-4 text-white/40 text-xs">
                    Click markers to view observation details • Coordinates based on real GPS data
                  </div>
                </div>
              </div>

              {/* Details Panel */}
              <div className="space-y-6">
                {selectedLocation ? (
                  <>
                    <div className="bg-[#12151C] border border-[#00F0FF] p-8">
                      <h2 className="tracking-tight uppercase mb-2" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                        {selectedLocation.location}
                      </h2>
                      <p className="text-white/50 uppercase tracking-wider mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                        {selectedLocation.country}
                      </p>
                      <p className="text-white/40 uppercase tracking-wider mb-6" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                        {selectedLocation.coords[0].toFixed(4)}° {selectedLocation.coords[0] >= 0 ? 'N' : 'S'}, {Math.abs(selectedLocation.coords[1]).toFixed(4)}° {selectedLocation.coords[1] >= 0 ? 'E' : 'W'}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4">
                          <div className="text-white/40 uppercase tracking-wider mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            Cases
                          </div>
                          <div className="text-[#00F0FF]" style={{ fontSize: '1.75rem' }}>
                            {selectedLocation.sightings.length}
                          </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4">
                          <div className="text-white/40 uppercase tracking-wider mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                            Avg Cred.
                          </div>
                          <div className="text-[#00F0FF]" style={{ fontSize: '1.75rem' }}>
                            {(selectedLocation.sightings.reduce((sum, s) => sum + s.credibility, 0) / selectedLocation.sightings.length).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observations at this location */}
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {selectedLocation.sightings.map(sighting => (
                        <Link
                          key={sighting.id}
                          to={`/observation/${sighting.id}`}
                          state={{ from: '/map' }}
                          className="block bg-[#12151C] border border-white/10 overflow-hidden transition-all hover:bg-white/5 hover:border-[#00F0FF]"
                        >
                          <div className="h-[100px] overflow-hidden bg-black">
                            <ImageWithFallback
                              src={sighting.imageUrl}
                              alt={sighting.location}
                              className="w-full h-full object-cover opacity-50"
                            />
                          </div>
                          <div className="p-4">
                            <p className="text-white/40 uppercase tracking-wider mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                              {sighting.date} @ {sighting.time}
                            </p>
                            <p className="text-white/70 text-sm mb-3 line-clamp-2">
                              {sighting.hatchDesc}
                            </p>
                            <div className="flex gap-2">
                              <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                                C: {sighting.credibility}
                              </div>
                              <div className="px-2 py-1 bg-white/5 border border-white/20 text-white/60" style={{ fontSize: '0.65rem' }}>
                                S: {sighting.strangeness}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#12151C] border border-white/10 p-12 text-center">
                    <RadialSymbol size={80} className="text-white opacity-10 mx-auto mb-6" rays={16} />
                    <p className="text-white/40 uppercase tracking-wider mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                      Select a location
                    </p>
                    <p className="text-white/30 text-sm">
                      Click on any marker to view observations
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // List View
            <div className="grid grid-cols-3 gap-6">
              {locationGroups.map(location => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location);
                    setViewMode('map');
                  }}
                  className="bg-[#12151C] border border-white/10 p-6 text-left transition-all hover:bg-white/5 hover:border-[#00F0FF]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="tracking-tight uppercase flex-1" style={{ fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                      {location.location}
                    </h3>
                    <div 
                      className="ml-3 px-2 py-1 bg-[#00F0FF] text-black rounded-full"
                      style={{ fontSize: '0.7rem', fontWeight: '700' }}
                    >
                      {location.sightings.length}
                    </div>
                  </div>
                  <p className="text-white/50 text-sm mb-2">{location.country}</p>
                  <p className="text-white/40 uppercase tracking-wider mb-4" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                    {location.coords[0].toFixed(2)}° {location.coords[0] >= 0 ? 'N' : 'S'}, {Math.abs(location.coords[1]).toFixed(2)}° {location.coords[1] >= 0 ? 'E' : 'W'}
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/5 border border-white/10 px-3 py-2">
                      <div className="text-white/40 text-xs mb-1">Avg Cred.</div>
                      <div className="text-[#00F0FF]">
                        {(location.sightings.reduce((sum, s) => sum + s.credibility, 0) / location.sightings.length).toFixed(1)}
                      </div>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 px-3 py-2">
                      <div className="text-white/40 text-xs mb-1">Avg Strange.</div>
                      <div className="text-[#00F0FF]">
                        {(location.sightings.reduce((sum, s) => sum + s.strangeness, 0) / location.sightings.length).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
