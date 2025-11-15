/**
 * Composable pour la gestion des tags
 * Centralise la logique métier liée aux tags
 */

import { ref } from "vue";
import { validateTag } from "../utils/validators";

export function useTags(initialTags = []) {
  // État
  const tags = ref([...initialTags]);
  const newTag = ref("");
  const error = ref(null);

  /**
   * Ajoute un tag à la liste
   * @param {string} tag - Tag à ajouter (optionnel, utilise newTag.value si non fourni)
   * @returns {boolean} true si ajouté avec succès
   */
  const addTag = (tag = null) => {
    const tagToAdd = tag || newTag.value;
    const validation = validateTag(tagToAdd, tags.value);

    if (!validation.valid) {
      error.value = validation.error;
      return false;
    }

    tags.value.push(validation.tag);
    newTag.value = "";
    error.value = null;

    console.log("✅ Tag ajouté:", validation.tag);
    return true;
  };

  /**
   * Supprime un tag par son index
   * @param {number} index - Index du tag à supprimer
   */
  const removeTag = (index) => {
    if (index >= 0 && index < tags.value.length) {
      const removedTag = tags.value.splice(index, 1)[0];
      console.log("✅ Tag supprimé:", removedTag);
    }
  };

  /**
   * Supprime un tag par sa valeur
   * @param {string} tag - Tag à supprimer
   */
  const removeTagByValue = (tag) => {
    const index = tags.value.indexOf(tag);
    if (index !== -1) {
      removeTag(index);
    }
  };

  /**
   * Nettoie tous les tags
   */
  const clearTags = () => {
    tags.value = [];
    newTag.value = "";
    error.value = null;
    console.log("✅ Tags nettoyés");
  };

  /**
   * Définit les tags (remplace tous les tags existants)
   * @param {Array<string>} newTags - Nouveaux tags
   */
  const setTags = (newTags) => {
    if (Array.isArray(newTags)) {
      tags.value = [...newTags];
      console.log("✅ Tags définis:", tags.value);
    }
  };

  /**
   * Vérifie si un tag existe
   * @param {string} tag - Tag à vérifier
   * @returns {boolean} true si le tag existe
   */
  const hasTag = (tag) => {
    return tags.value.includes(tag);
  };

  /**
   * Récupère le nombre de tags
   * @returns {number} Nombre de tags
   */
  const getTagCount = () => {
    return tags.value.length;
  };

  /**
   * Ajoute un tag lorsque l'utilisateur appuie sur Entrée
   * @param {Event} event - Événement clavier
   */
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  return {
    // État
    tags,
    newTag,
    error,

    // Méthodes
    addTag,
    removeTag,
    removeTagByValue,
    clearTags,
    setTags,
    hasTag,
    getTagCount,
    handleKeyPress,
  };
}
