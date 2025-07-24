import { asyncHandler } from "../utils/asyncHandler.js";

const getUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User data retrieved successfully",
    user: req.user, // Assuming user data is attached to req.user
  });
});

export { getUser };
