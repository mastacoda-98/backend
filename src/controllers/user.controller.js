import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import fs from "fs"; // file system module in node to handle file operations

// Helper function to clean up uploaded files
const cleanupFiles = (req) => {
  if (req.files) {
    Object.keys(req.files).forEach(fieldName => {
      req.files[fieldName].forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log("Cleaned up file:", file.path);
        }
      });
    });
  }
};

const getUser = asyncHandler(async (req, res) => {
  // Logic to handle user registration
  // get user details from req.body passed from frontend
  // validation
  // check if user already exists
  // upload on cloudinary if avatar is provided
  // create user in database and send response

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    cleanupFiles(req); // Clean up uploaded files before throwing error
    throw new apiError(400, "Please provide all required fields");
  }

  if ((await User.findOne({ username })) || (await User.findOne({ email }))) {
    cleanupFiles(req); // Clean up uploaded files before throwing error
    throw new apiError(400, "Username or Email already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path; // syntax to access the first file in the array
  const coverPath = req.files?.cover?.[0]?.path;

  console.log("File paths:", { avatarPath, coverPath });

  if (!avatarPath) {
    cleanupFiles(req); // Clean up uploaded files before throwing error
    throw new apiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarPath);
  const cover = coverPath ? await uploadOnCloudinary(coverPath) : null;

  if (!avatar) {
    throw new apiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    username,
    email,
    password,
    avatar: avatar.url,
    cover: cover?.url || "https://example.com/default-cover.png",
  });

  const cur = await User.findById(user._id).select("-password -refreshToken"); // very weird syntax, it deselects password and refreshToken fields from the user object

  if (!cur) {
    throw new apiError(500, "User creation failed");
  }

  res.status(201).json({
    data: new apiResponse(201, "User created successfully", cur),
  });
});

export { getUser };
export default getUser;
