/**
 * Extracts pagination parameters from the request
 * @param {Object} query - Express request query object
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    parseInt(query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
    parseInt(process.env.MAX_PAGE_SIZE) || 100
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Creates a pagination metadata object
 * @param {number} total - Total number of elements
 * @param {number} page - Current page
 * @param {number} limit - Number of elements per page
 * @returns {Object} Pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Formats the paginated response
 * @param {Array} data - Data to return
 * @param {number} total - Total number of elements
 * @param {number} page - Current page
 * @param {number} limit - Number of elements per page
 * @returns {Object} Formatted response
 */
export const paginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: createPaginationMeta(total, page, limit),
  };
};
