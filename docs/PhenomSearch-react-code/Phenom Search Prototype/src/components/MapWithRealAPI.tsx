import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAPI, type Sighting } from '../contexts/APIContext';
import Header from './Header';
import Footer from './Footer';
import RadialSymbol from './RadialSymbol';
import LoadingState from './LoadingState';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Globe, List, ZoomIn, ZoomOut, RotateCcw, AlertCircle } from 'lucide-react';

interface LocationGroup {
  id: string;
  location: string;
  country: string;
  lat: number;
  lon: number;
  sightings: Sighting[];
}

type ViewMode = 'map' | 'list';

// Convert lat/lon to pixel position on map
const latLonToPixel = (lat: number, lon: number, zoom: number, tileSize: number = 256) => {
  const scale = tileSize * Math.pow(2, zoom);
  const worldX = (lon + 180) / 360 * scale;
  const latRad = lat * Math.PI / 180;
  const worldY = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * scale;
  return { x: worldX, y: worldY };
};

export default function MapWithRealAPI() {
  const { sightings, loading, error } = useAPI();
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [zoom, setZoom] = useState(2);
  const [center, setCenter] = useState({ lat: 20, lon: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, centerLat: 0, centerLon: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 900, height: 700 });
  const [visibleLocations, setVisibleLocations] = useState<LocationGroup[]>([]);

  // Group sightings by location + coordinates (to handle duplicate location names)
  const allLocationGroups: LocationGroup[] = useMemo(() => {
    const groups: { [key: string]: Sighting[] } = {};
    
    // Only process sightings with coordinates
    const sightingsWithCoords = sightings.filter(s => s.latLon !== null);
    
    sightingsWithCoords.forEach(sighting => {
      const [lat, lon] = sighting.latLon!;
      // Create unique key combining location and rounded coordinates
      const uniqueKey = `${sighting.location}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
      
      if (!groups[uniqueKey]) {
        groups[uniqueKey] = [];
      }
      groups[uniqueKey].push(sighting);
    });

    const result = Object.entries(groups).map(([uniqueKey, sightings], index) => {
      const [location, latStr, lonStr] = uniqueKey.split('|');
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      
      return {
        id: `loc-${index}-${location.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30)}`,
        location,
        country: sightings[0].country,
        lat,
        lon,
        sightings
      };
    });

    return result;
  }, [sightings]);

  // Filter visible locations based on zoom and viewport
  useEffect(() => {
    const tileSize = 256;
    const scale = tileSize * Math.pow(2, zoom);
    
    // Calculate viewport bounds
    const centerPos = latLonToPixel(center.lat, center.lon, zoom, tileSize);
    const viewportMinX = centerPos.x - mapSize.width / 2;
    const viewportMaxX = centerPos.x + mapSize.width / 2;
    const viewportMinY = centerPos.y - mapSize.height / 2;
    const viewportMaxY = centerPos.y + mapSize.height / 2;
    
    // Filter locations that are in viewport
    let filtered = allLocationGroups.filter(location => {
      const pos = latLonToPixel(location.lat, location.lon, zoom, tileSize);
      return pos.x >= viewportMinX && pos.x <= viewportMaxX &&
             pos.y >= viewportMinY && pos.y <= viewportMaxY;
    });
    
    // Limit to max 500 markers for performance
    if (filtered.length > 500) {
      // Sort by number of sightings and take top 500
      filtered = filtered
        .sort((a, b) => b.sightings.length - a.sightings.length)
        .slice(0, 500);
    }
    
    setVisibleLocations(filtered);
  }, [allLocationGroups, zoom, center, mapSize]);

  const locationGroups = visibleLocations;

  useEffect(() => {
    const updateSize = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        setMapSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [viewMode]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 10));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));
  const handleReset = () => {
    setZoom(2);
    setCenter({ lat: 20, lon: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      centerLat: center.lat,
      centerLon: center.lon
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const scale = 256 * Math.pow(2, zoom);
    const dLon = -(dx / scale) * 360;
    const dLat = (dy / scale) * 180;

    setCenter({
      lat: Math.max(-85, Math.min(85, dragStart.centerLat + dLat)),
      lon: dragStart.centerLon + dLon
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Calculate visible tiles
  const getTilesToRender = () => {
    const tileSize = 256;
    const centerPixel = latLonToPixel(center.lat, center.lon, zoom, tileSize);
    const offsetX = mapSize.width / 2 - centerPixel.x;
    const offsetY = mapSize.height / 2 - centerPixel.y;

    const startTileX = Math.floor(-offsetX / tileSize);
    const startTileY = Math.floor(-offsetY / tileSize);
    const endTileX = Math.ceil((mapSize.width - offsetX) / tileSize);
    const endTileY = Math.ceil((mapSize.height - offsetY) / tileSize);

    const tiles: Array<{ x: number; y: number; px: number; py: number }> = [];
    
    for (let tileX = startTileX; tileX < endTileX; tileX++) {
      for (let tileY = startTileY; tileY < endTileY; tileY++) {
        const maxTile = Math.pow(2, zoom);
        const wrappedX = ((tileX % maxTile) + maxTile) % maxTile;
        
        if (tileY >= 0 && tileY < maxTile) {
          tiles.push({
            x: wrappedX,
            y: tileY,
            px: offsetX + tileX * tileSize,
            py: offsetY + tileY * tileSize
          });
        }
      }
    }
    
    return { tiles, offsetX, offsetY };
  };

  const { tiles, offsetX, offsetY } = getTilesToRender();

  // Convert location to screen coordinates
  const getMarkerPosition = (lat: number, lon: number) => {
    const pixel = latLonToPixel(lat, lon, zoom, 256);
    return {
      x: pixel.x + offsetX,
      y: pixel.y + offsetY
    };
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading UFO observations map..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#080A0E] text-white">
        <Header />
        <div className="pt-[73px] px-20 py-20">
          <div className="max-w-[800px] mx-auto">
            <div className="bg-[#12151C] border border-red-500/50 p-8">
              <div className="flex items-center gap-4 mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h2 className="text-xl mb-2">API Connection Error</h2>
                  <p className="text-white/60">{error}</p>
                </div>
              </div>
              <p className="text-white/40 text-sm mt-4">
                Unable to load data from Phenom Search API
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-3 bg-[#00F0FF] text-black uppercase tracking-wider hover:bg-[#00D0DF] transition-colors"
                style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Interactive OpenStreetMap visualization of {sightings.filter(s => s.latLon).length.toLocaleString()} geocoded UFO observations from {allLocationGroups.length.toLocaleString()} unique locations worldwide.
              </p>
              <p className="text-[#00F0FF] text-sm mt-2 uppercase tracking-wider flex items-center gap-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-pulse" />
                Showing {locationGroups.length} locations in current view • Zoom to see more
              </p>
            </div>
            <div className="flex items-center gap-4">
              <RadialSymbol size={120} className="text-white opacity-10" rays={24} />
              
              <div className="bg-[#12151C] border border-white/10 p-1 flex gap-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
                    viewMode === 'map' ? 'bg-[#00F0FF] text-black' : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
                >
                  <Globe size={14} />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 flex items-center gap-2 uppercase tracking-wider transition-all ${
                    viewMode === 'list' ? 'bg-[#00F0FF] text-black' : 'text-white/60 hover:text-white'
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
                  className="relative w-full bg-[#0a0e14] border border-white/10 overflow-hidden"
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
                  {/* OpenStreetMap Tiles */}
                  {tiles.map((tile, idx) => (
                    <img
                      key={`${tile.x}-${tile.y}-${idx}`}
                      src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
                      alt=""
                      className="absolute pointer-events-none"
                      style={{
                        left: `${tile.px}px`,
                        top: `${tile.py}px`,
                        width: '256px',
                        height: '256px',
                        opacity: 0.7
                      }}
                    />
                  ))}

                  {/* Location Markers */}
                  {locationGroups.map(location => {
                    const pos = getMarkerPosition(location.lat, location.lon);
                    
                    // Only render if visible
                    if (pos.x < -50 || pos.x > mapSize.width + 50 ||
                        pos.y < -50 || pos.y > mapSize.height + 50) {
                      return null;
                    }

                    const isHovered = hoveredLocation === location.id;
                    const isSelected = selectedLocation?.id === location.id;
                    const baseSize = 16;
                    const size = baseSize + Math.min(location.sightings.length * 3, 24);

                    return (
                      <button
                        key={location.id}
                        className="absolute z-10 transition-transform hover:scale-110"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseEnter={() => setHoveredLocation(location.id)}
                        onMouseLeave={() => setHoveredLocation(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(location);
                        }}
                      >
                        {/* Pulse animation */}
                        {(isHovered || isSelected) && (
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00F0FF] animate-ping"
                            style={{
                              width: `${size + 20}px`,
                              height: `${size + 20}px`,
                              animationDuration: '2s'
                            }}
                          />
                        )}

                        {/* Main marker */}
                        <div
                          className="rounded-full border-3 relative"
                          style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            backgroundColor: isSelected ? '#00F0FF' : 'rgba(0, 240, 255, 0.9)',
                            borderColor: '#000000',
                            borderWidth: '3px',
                            boxShadow: isSelected
                              ? '0 0 30px rgba(0, 240, 255, 1)'
                              : '0 0 15px rgba(0, 240, 255, 0.7)'
                          }}
                        >
                          {/* Count badge */}
                          {location.sightings.length > 1 && (
                            <div
                              className="absolute -top-2 -right-2 bg-[#00F0FF] text-black rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-black"
                              style={{ fontSize: '0.65rem', fontWeight: '700' }}
                            >
                              {location.sightings.length}
                            </div>
                          )}
                        </div>

                        {/* Tooltip */}
                        {isHovered && (
                          <div
                            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 border border-[#00F0FF] px-4 py-2 pointer-events-none z-50"
                            style={{
                              bottom: `${size + 8}px`,
                              maxWidth: '220px'
                            }}
                          >
                            <div className="uppercase tracking-wider text-[#00F0FF] mb-1" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                              {location.location}
                            </div>
                            <div className="text-white/50 text-xs">
                              {location.sightings.length} case{location.sightings.length > 1 ? 's' : ''}
                            </div>
                            <div className="text-white/40 text-xs font-mono mt-1">
                              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button
                      onClick={handleZoomIn}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-[#12151C]/95 border border-white/20 p-3 hover:bg-[#00F0FF] hover:text-black transition-all"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>

                  {/* Decorations */}
                  <div className="absolute top-4 left-4 opacity-10 pointer-events-none">
                    <RadialSymbol size={60} className="text-[#00F0FF]" rays={12} />
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none">
                    <RadialSymbol size={60} className="text-[#00F0FF]" rays={12} />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 bg-black/90 border border-white/20 px-4 py-2 pointer-events-none z-20">
                    <div className="text-white/60 uppercase tracking-wider" style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>
                      {locationGroups.length} Locations • {sightings.length} Cases • Live API Data • Zoom: {zoom}
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
                      <div className="w-4 h-4 rounded-full border-3 border-black" style={{ backgroundColor: 'rgba(0, 240, 255, 0.9)' }} />
                      <span className="text-white/50" style={{ fontSize: '0.8rem' }}>Single Case</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full border-3 border-black" style={{ backgroundColor: 'rgba(0, 240, 255, 0.9)' }} />
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
                    Drag to pan • Scroll or buttons to zoom • Click markers for details • Data: © OpenStreetMap contributors
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
                        GPS: {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
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
                      Click any marker to view observations
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
                    setCenter({ lat: location.lat, lon: location.lon });
                    setZoom(8);
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
                    {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
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
      
      <Footer />
    </div>
  );
}
