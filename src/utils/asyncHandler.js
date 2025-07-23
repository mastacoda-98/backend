const asyncHandler = (requestHandler) => { // to handle async errors in Express.js
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => { 
      next(error);
    });
  };
};
export { asyncHandler };
