const asyncHandler = (requestHandler) => {
  // to handle async errors in Express.js, inside it we can pass a function that takes req, res, and next
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res)).catch((error) => {
      next(error);
    });
  };
};
export { asyncHandler };
