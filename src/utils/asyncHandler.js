const asyncHandler = (requestHandler) => {
  // to handle async errors in Express.js, inside it we can pass a function that takes req, res, and next
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      next(error); // Pass error to Express error handling middleware, in built Express.js
    }
  };
};

// Alternative: Promise-based version (your original)
const asyncHandlerPromise = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

export { asyncHandler };
