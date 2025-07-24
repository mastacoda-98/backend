class apiError extends Error {
  // Custom error class for API errors, learn from node error doc
  constructor(
    statusCode,
    message = "Something went wrong",
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

export default apiError;
