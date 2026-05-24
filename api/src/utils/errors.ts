/**
 * Returns a 404 response with proper status code.
 * Usage: return notFound(set, 'Resource not found')
 */
export function notFound(set: { status?: any }, message = 'Not found') {
  set.status = 404
  return { error: message }
}

/**
 * Returns a 400 response with proper status code.
 * Usage: return badRequest(set, 'Invalid input')
 */
export function badRequest(set: { status?: any }, message = 'Bad request') {
  set.status = 400
  return { error: message }
}

/**
 * Returns a 403 response with proper status code.
 * Usage: return forbidden(set, 'Access denied')
 */
export function forbidden(set: { status?: any }, message = 'Forbidden') {
  set.status = 403
  return { error: message }
}

/**
 * Returns a 409 response with proper status code.
 * Usage: return conflict(set, 'Resource already exists')
 */
export function conflict(set: { status?: any }, message = 'Conflict') {
  set.status = 409
  return { error: message }
}

/**
 * Returns a 401 response with proper status code.
 * Usage: return unauthorized(set, 'Authentication required')
 */
export function unauthorized(set: { status?: any }, message = 'Authentication required') {
  set.status = 401
  return { error: message }
}

/**
 * Returns a 500 response with proper status code.
 * Usage: return serverError(set, 'Failed to process')
 */
export function serverError(set: { status?: any }, message = 'Internal server error') {
  set.status = 500
  return { error: message }
}
