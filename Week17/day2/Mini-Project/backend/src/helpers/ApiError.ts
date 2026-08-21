/**
 * An error that is safe to show to the user.
 *
 * The distinction matters for the brief's requirement to "return a helpful message ...
 * without revealing any technical details that could help a malicious user":
 *
 *   - `ApiError` -> deliberately written for the user; the error handler sends its
 *     message through as-is.
 *   - anything else (a `TypeError`, a `pg` driver error, ...) -> unexpected; the error
 *     handler logs it server-side and sends a generic 500 message instead, so stack
 *     traces, table names and SQL never reach the client.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message: string, errors?: Record<string, string>): ApiError {
    return new ApiError(400, message, errors);
  }

  /** 401: not authenticated -- no token, bad token, expired token. */
  static unauthorized(message = "You must be logged in to do that."): ApiError {
    return new ApiError(401, message);
  }

  /** 403: authenticated, but not allowed to touch this particular resource. */
  static forbidden(message = "You are not authorized to perform this action."): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found."): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
}
