class apiError extends Error { // Custom error class for API errors, learn from node error doc
  constructor(
    message = "Something went wrong",
    statusCode,
    error = [],
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
    this.stack = stack;
  }
}
