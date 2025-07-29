import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyToken = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      new apiError(401, "Unauthorized: No token provided");
    }

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decode) {
      throw new apiError(401, "Unauthorized: Invalid token");
    }

    const user = await User.findById(decode._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new apiError(404, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new apiError(401, error.message || "Unauthorized: Invalid token");
  }
});

export { verifyToken };
