export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(msg: string, errors?: any[]) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg: string = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static forbidden(msg: string = "Forbidden") {
    return new ApiError(403, msg);
  }

  static notFound(msg: string = "Not found") {
    return new ApiError(404, msg);
  }

  static tooManyRequests(msg: string = "Too many requests") {
    return new ApiError(429, msg);
  }

  static internal(msg: string = "Internal server error") {
    return new ApiError(500, msg);
  }
}
