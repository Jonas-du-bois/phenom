/**
 * Composable pour la gestion des uploads d'images
 * Centralise la logique d'upload et de validation d'images
 */

import { ref } from 'vue'
import { validateImageFile, createImagePreview } from '../utils/imageHelpers'
import { imageService } from '../services/imageService'

export function useImageUpload(options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10 MB par défaut
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    autoPreview = true
  } = options

  // État
  const file = ref(null)
  const preview = ref(null)
  const uploading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  /**
   * Gère la sélection d'un fichier
   * @param {Event} event - Événement de changement du input file
   * @returns {boolean} true si le fichier est valide
   */
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0]
    
    if (!selectedFile) {
      clearFile()
      return false
    }

    // Valider le fichier
    const validation = validateImageFile(selectedFile, { maxSize, allowedTypes })
    
    if (!validation.valid) {
      error.value = validation.error
      event.target.value = '' // Réinitialiser l'input
      return false
    }

    // Stocker le fichier
    file.value = selectedFile
    error.value = null

    // Créer un aperçu si demandé
    if (autoPreview) {
      try {
        preview.value = await createImagePreview(selectedFile)
        console.log('✅ Aperçu créé')
      } catch (err) {
        console.error('❌ Erreur lors de la création de l\'aperçu:', err)
      }
    }

    console.log('✅ Fichier sélectionné:', {
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      type: selectedFile.type
    })

    return true
  }

  /**
   * Upload un fichier vers le serveur
   * @param {string} observationId - ID de l'observation (optionnel)
   * @returns {Promise<Object|null>} Réponse du serveur ou null
   */
  const uploadFile = async (observationId = null) => {
    if (!file.value) {
      error.value = 'Aucun fichier sélectionné'
      return null
    }

    try {
      uploading.value = true
      error.value = null
      uploadProgress.value = 0

      let response
      if (observationId) {
        // Upload vers une observation spécifique
        response = await imageService.uploadToObservation(observationId, file.value, {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })
      } else {
        // Upload générique
        response = await imageService.upload(file.value, {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })
      }

      console.log('✅ Image uploadée avec succès')
      return response
    } catch (err) {
      console.error('❌ Erreur lors de l\'upload:', err)
      error.value = err.response?.data?.message || err.message || 'Erreur d\'upload'
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Nettoie le fichier et l'aperçu
   */
  const clearFile = () => {
    file.value = null
    preview.value = null
    error.value = null
    uploadProgress.value = 0
    console.log('✅ Fichier nettoyé')
  }

  /**
   * Définit manuellement un fichier
   * @param {File} newFile - Nouveau fichier
   */
  const setFile = async (newFile) => {
    const validation = validateImageFile(newFile, { maxSize, allowedTypes })
    
    if (!validation.valid) {
      error.value = validation.error
      return false
    }

    file.value = newFile
    error.value = null

    if (autoPreview) {
      try {
        preview.value = await createImagePreview(newFile)
      } catch (err) {
        console.error('❌ Erreur lors de la création de l\'aperçu:', err)
      }
    }

    return true
  }

  /**
   * Vérifie si un fichier est sélectionné
   * @returns {boolean} true si un fichier est sélectionné
   */
  const hasFile = () => {
    return file.value !== null
  }

  /**
   * Récupère les informations du fichier
   * @returns {Object|null} Informations du fichier
   */
  const getFileInfo = () => {
    if (!file.value) return null
    
    return {
      name: file.value.name,
      size: file.value.size,
      type: file.value.type,
      sizeKB: (file.value.size / 1024).toFixed(2),
      sizeMB: (file.value.size / (1024 * 1024)).toFixed(2)
    }
  }

  return {
    // État
    file,
    preview,
    uploading,
    error,
    uploadProgress,
    
    // Méthodes
    handleFileSelect,
    uploadFile,
    clearFile,
    setFile,
    hasFile,
    getFileInfo
  }
}
