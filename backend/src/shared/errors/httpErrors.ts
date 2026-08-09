/**
 * Standard HTTP Exception base class for Health AI application.
 */
export class HttpErrors extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number, options?: { cause?: unknown }) {
    super(message, options);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends HttpErrors {
  constructor(message = 'Bad Request', options?: { cause?: unknown }) {
    super(message, 400, options);
  }
}

export class UnauthorizedError extends HttpErrors {
  constructor(message = 'Unauthorized', options?: { cause?: unknown }) {
    super(message, 401, options);
  }
}

export class ForbiddenError extends HttpErrors {
  constructor(message = 'Forbidden', options?: { cause?: unknown }) {
    super(message, 403, options);
  }
}

export class NotFoundError extends HttpErrors {
  constructor(message = 'Not Found', options?: { cause?: unknown }) {
    super(message, 404, options);
  }
}

export class ConflictError extends HttpErrors {
  constructor(message = 'Conflict', options?: { cause?: unknown }) {
    super(message, 409, options);
  }
}

export class UnprocessableEntityError extends HttpErrors {
  constructor(message = 'Unprocessable Entity', options?: { cause?: unknown }) {
    super(message, 422, options);
  }
}

export class TooManyRequestsError extends HttpErrors {
  constructor(message = 'Too Many Requests', options?: { cause?: unknown }) {
    super(message, 429, options);
  }
}

export class InternalServerError extends HttpErrors {
  constructor(message = 'Internal Server Error', options?: { cause?: unknown }) {
    super(message, 500, options);
  }
}

export class ServiceUnavailableError extends HttpErrors {
  constructor(message = 'Service Unavailable', options?: { cause?: unknown }) {
    super(message, 503, options);
  }
}
