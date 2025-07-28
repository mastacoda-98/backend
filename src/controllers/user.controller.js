import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import fs from "fs"; // file system module in node to handle file operations

const getUser = asyncHandler(async (req, res) => {
  // Logic to handle user registration
  // get user details from req.body passed from frontend
  // validation
  // check if user already exists
  // upload on cloudinary if avatar is provided
  // create user in database and send response

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new apiError(400, "Please provide all required fields");
  }

  if ((await User.findOne({ username })) || (await User.findOne({ email }))) {
    throw new apiError(400, "Username or Email already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path; // syntax to access the first file in the array
  const coverPath = req.files?.cover?.[0]?.path;

  console.log("File paths:", { avatarPath, coverPath });

  if (!avatarPath) {
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new apiError(400, "Email or Username is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid password");
  }

  const refreshToken = user.generateRefreshToken();
  const accessToken = user.generateAuthToken();

  user.refreshToken = refreshToken;
  await user.save();

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    // Set cookie options, you can customize these as needed
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // Set the access token in a cookie
    .cookie("refreshToken", refreshToken, options) // Set the refresh token in a cookie
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  const options = {
    // Set cookie options, you can customize these as needed
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options) // Clear the access token cookie
    .clearCookie("refreshToken", options) // Clear the refresh token cookie
    .json(new apiResponse(200, {}, "Logout successful")); // Send a success response
});

export { getUser, loginUser, logoutUser };
