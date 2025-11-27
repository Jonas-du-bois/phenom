/**
 * HOF (Higher-Order Function) pour gérer les erreurs dans les contrôleurs asynchrones
 * @param {Function} fn - La fonction de contrôleur asynchrone
 * @returns {Function} Une nouvelle fonction qui attrape les erreurs et les passe à next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
