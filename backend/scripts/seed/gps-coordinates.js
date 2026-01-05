/**
 * GPS coordinates for major cities
 * MongoDB GeoJSON format: [longitude, latitude]
 *
 * ⚠️ WARNING: Order is [lng, lat] (reversed compared to Google Maps!)
 */

export const GPS_COORDINATES = {
  // === SWITZERLAND ===
  suisse: {
    lausanne: [6.6323, 46.5197],
    geneve: [6.1432, 46.2044],
    berne: [7.4474, 46.948],
    zurich: [8.5417, 47.3769],
    lucerne: [8.3093, 47.0502],
    montreux: [6.9111, 46.4312],
    neuchatel: [6.9306, 46.992],
    fribourg: [7.1512, 46.806],
    lugano: [8.9511, 46.0037],
    basel: [7.5886, 47.5596],
    sion: [7.3586, 46.233],
    vevey: [6.8435, 46.4604],
    nyon: [6.2391, 46.3826],
    yverdon: [6.6414, 46.7784],
    morges: [6.4988, 46.5104],
  },

  // === FRANCE ===
  france: {
    paris: [2.3522, 48.8566],
    lyon: [4.8357, 45.764],
    marseille: [5.3698, 43.2965],
    toulouse: [1.4442, 43.6047],
    nice: [7.2619, 43.7102],
    bordeaux: [-0.5792, 44.8378],
    strasbourg: [7.7521, 48.5734],
    lille: [3.0573, 50.6292],
    montpellier: [3.8767, 43.6108],
    rennes: [-1.6778, 48.1173],
    reims: [4.0317, 49.2583],
    nantes: [-1.5536, 47.2184],
    grenoble: [5.7243, 45.1885],
    annecy: [6.1294, 45.8992],
    dijon: [5.0415, 47.322],
    tours: [0.6833, 47.3941],
    metz: [6.1757, 49.1193],
  },
};

/**
 * Helper to get coordinates for a city
 * @param {string} country - 'suisse' or 'france'
 * @param {string} city - city name (lowercase)
 * @returns {Array} [longitude, latitude]
 */
export const getCoordinates = (country, city) => {
  const coordinates = GPS_COORDINATES[country]?.[city];
  if (!coordinates) {
    throw new Error(`Ville non trouvée: ${country}/${city}`);
  }
  return coordinates;
};

/**
 * Helper to create a GeoJSON Point
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {Object} GeoJSON Point
 */
export const createGeoPoint = (coordinates) => {
  return {
    type: "Point",
    coordinates: coordinates,
  };
};

/**
 * Usage examples:
 *
 * import { GPS_COORDINATES, getCoordinates, createGeoPoint } from './gps-coordinates.js';
 *
 * // Method 1: Directly
 * const lausanne = GPS_COORDINATES.suisse.lausanne; // [6.6323, 46.5197]
 *
 * // Method 2: With helper
 * const paris = getCoordinates('france', 'paris'); // [2.3522, 48.8566]
 *
 * // Method 3: Create a GeoJSON Point
 * const location = createGeoPoint(GPS_COORDINATES.suisse.geneve);
 * // { type: 'Point', coordinates: [6.1432, 46.2044] }
 *
 * // Method 4: Chain helpers
 * const observation = {
 *   title: 'Mon observation',
 *   location: createGeoPoint(getCoordinates('france', 'lyon'))
 * };
 */

/**
 * List of all available cities
 */
export const AVAILABLE_CITIES = {
  suisse: Object.keys(GPS_COORDINATES.suisse).sort(),
  france: Object.keys(GPS_COORDINATES.france).sort(),
};

/**
 * Find the nearest city to given coordinates
 * @param {Array} targetCoords - [longitude, latitude]
 * @param {string} country - 'suisse' or 'france' (optional)
 * @returns {Object} { city, country, distance, coordinates }
 */
export const findNearestCity = (targetCoords, country = null) => {
  const [targetLng, targetLat] = targetCoords;
  let nearest = null;
  let minDistance = Infinity;

  const countries = country ? [country] : ["suisse", "france"];

  countries.forEach((countryName) => {
    Object.entries(GPS_COORDINATES[countryName]).forEach(([city, coords]) => {
      const [lng, lat] = coords;

      // Simple Euclidean distance (sufficient for this use case)
      const distance = Math.sqrt(
        Math.pow(lng - targetLng, 2) + Math.pow(lat - targetLat, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = {
          city,
          country: countryName,
          distance: distance.toFixed(4),
          coordinates: coords,
        };
      }
    });
  });

  return nearest;
};

/**
 * Check if coordinates are valid
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {boolean}
 */
export const areValidCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [lng, lat] = coordinates;

  // Longitude: -180 to 180
  // Latitude: -90 to 90
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
};

/**
 * Format coordinates for display
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {string}
 */
export const formatCoordinates = (coordinates) => {
  const [lng, lat] = coordinates;
  return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
};
