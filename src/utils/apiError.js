class apiError extends Error {
  constructor(
    message = "Something went wrong",
    statusCode,
    error = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.stack = stack;
  }
}
