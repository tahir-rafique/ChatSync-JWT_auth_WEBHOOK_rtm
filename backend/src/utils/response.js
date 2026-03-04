// ── Standardized API Response Helpers ────────────────────

/**
 * Send a success response
 */
const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Send a paginated response
 */
const sendPaginated = (res, data, total, page, limit, message = "Data fetched") => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Send an error response (typically handled by errorHandler middleware)
 */
const sendError = (res, message = "Something went wrong", statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendPaginated, sendError };
