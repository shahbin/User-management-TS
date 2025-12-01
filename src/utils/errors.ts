/**
 * Custom Application Error Classes
 * Provides structured error handling for the application
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 * Used for request validation failures (400)
 */
export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(message: string = "Validation failed", errors: Record<string, string[]> = {}) {
    super(400, message, true);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error
 * Used for authentication failures (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(401, message, true);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error
 * Used for authorization failures (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(403, message, true);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error
 * Used when a resource is not found (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error
 * Used for resource conflicts (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(409, message, true);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Internal Server Error
 * Used for unexpected errors (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(500, message, true);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
