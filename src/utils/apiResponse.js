class apiResponse {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode; // HTTP status code
    this.message = message; // Response message
    this.data = data; // Data to be returned in the response
    this.success = statusCode >= 200 && statusCode < 300; // Determine if the response is successful, learn more about HTTP status codes
  }
}

export default apiResponse;
