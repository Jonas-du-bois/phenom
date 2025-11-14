/**
 * Utilitaires pour la gestion des images avec Cloudinary
 * Les images sont maintenant stockées sur Cloudinary avec URLs publiques
 */

/**
 * Récupère l'URL d'une image Cloudinary
 * @param {string} observationId - ID de l'observation (non utilisé avec Cloudinary)
 * @param {Object} imageData - Données de l'image contenant l'URL Cloudinary
 * @param {Object} options - Options de transformation (optionnel)
 * @returns {string} URL de l'image Cloudinary ou placeholder
 */
export const getImageUrl = (observationId, imageData, options = {}) => {
  // Récupérer l'URL depuis les données de l'image
  const url = imageData?.url
  
  if (!url) {
    return getPlaceholderImage('Image non disponible')
  }
  
  // Si des transformations sont demandées, modifier l'URL Cloudinary
  if (options.width || options.height) {
    const parts = url.split('/upload/')
    if (parts.length === 2) {
      const transforms = []
      if (options.width) transforms.push(`w_${options.width}`)
      if (options.height) transforms.push(`h_${options.height}`)
      if (options.crop) transforms.push(`c_${options.crop}`)
      return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`
    }
  }
  
  return url
}

/**
 * Charge toutes les images d'une observation
 * Avec Cloudinary, plus besoin de charger via l'API !
 * @param {Object} observation - Observation contenant des images
 * @returns {Promise<void>}
 */
export const loadImagesForObservation = async (observation) => {
  // Plus rien à faire, les URLs sont déjà publiques
  console.log(`📸 ${observation.images?.length || 0} images Cloudinary pour observation ${observation._id}`)
}

/**
 * Génère une image placeholder SVG inline
 * @param {string} text - Texte à afficher
 * @param {number} width - Largeur de l'image
 * @param {number} height - Hauteur de l'image
 * @returns {string} Data URL SVG
 */
export const getPlaceholderImage = (text = 'Image', width = 400, height = 300) => {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%239ca3af">${encodeURIComponent(text)}</text></svg>`
}

/**
 * Gestionnaire d'erreur pour les images
 * @param {Event} event - Événement error de l'image
 */
export const handleImageError = (event) => {
  console.warn('❌ Image blob non disponible')
  event.target.src = getPlaceholderImage('Image non disponible')
  event.target.classList.add('opacity-50')
}

/**
 * Nettoie tous les blobs du cache (à appeler au démontage du composant)
 */
export const cleanupImageBlobs = () => {
  imageBlobCache.forEach(blobUrl => {
    URL.revokeObjectURL(blobUrl)
  })
  imageBlobCache.clear()
  console.log('🧹 Cache d\'images nettoyé')
}

/**
 * Nettoie un blob spécifique
 * @param {string} imageId - ID de l'image à nettoyer
 */
export const cleanupImageBlob = (imageId) => {
  const blobUrl = imageBlobCache.get(imageId)
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    imageBlobCache.delete(imageId)
  }
}

/**
 * Valide un fichier image avant upload
 * @param {File} file - Fichier à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10 MB par défaut
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  } = options

  if (!file) {
    return { valid: false, error: 'Aucun fichier sélectionné' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Format non valide. Formats acceptés: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    }
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
    return { 
      valid: false, 
      error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB} MB`
    }
  }

  return { valid: true, error: null }
}

/**
 * Crée un aperçu d'une image sélectionnée
 * @param {File} file - Fichier image
 * @returns {Promise<string>} URL de l'aperçu (data URL)
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Récupère le nombre d'images en cache
 * @returns {number} Nombre d'images
 */
export const getCachedImageCount = () => {
  return imageBlobCache.size
}
