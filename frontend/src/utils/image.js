/**
 * Utilitaires pour le traitement des images
 */

/**
 * Compresse une image
 */
export async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  // Logique de compression
  return file
}

/**
 * Convertit un fichier en base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Valide le type et la taille d'une image
 */
export function validateImage(file, maxSize = 5 * 1024 * 1024) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  return validTypes.includes(file.type) && file.size <= maxSize
}
