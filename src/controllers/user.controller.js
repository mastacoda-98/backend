import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiError from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";
import fs from "fs"; // file system module in node to handle file operations
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
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
  const { username, email, password } = req.body;
  if (!email && !username) {
    throw new apiError(400, "Email or Username is required");
  }

  if (!password) {
    throw new apiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

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
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: null },
    { new: true }
  );

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

const refreshUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new apiError(401, "Unauthorized: No refresh token provided");
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new apiError(404, "Invalid refresh token");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const newAccessToken = await user.generateAuthToken();
  const newRefreshToken = await user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save();

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, options) // Set the new access token in a cookie
    .cookie("refreshToken", newRefreshToken, options) // Set the new refresh token in a cookie
    .json(
      new apiResponse(200, "Tokens refreshed successfully", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    );
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new apiError(404, "User not found");
  }

  res.status(200).json({
    data: new apiResponse(200, "User retrieved successfully", user),
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const localPath = req.file?.path; // Access the uploaded avatar file path

  if (!localPath) {
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(localPath);

  if (!avatar?.url) {
    throw new apiError(500, "Failed to upload avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true } // what this does is that it will return new updated object
  ).select("-password -refreshToken");

  if (!user) {
    throw new apiError(500, "Failed to update avatar");
  }

  res
    .status(200)
    .json(new apiResponse(200, "Avatar updated successfully", user));
});

const getChannelProfile = asyncHandler(async (res, req) => {
  const { username } = req.params;

  if (!username) {
    throw new apiError(400, "Username is required");
  }

  const channel = await User.aggregate[
    ({
      $match: { username: username },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // User field
        foreignField: "channel", // Subscription field
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id", // User field
        foreignField: "subscriber", // Subscription field
        as: "subscriptions",
      },
    },
    {
      $addFields: {
        // adds a new field to the document channel
        subscribersCount: { $size: "$subscribers" }, // Count of subscribers
        subscriptionCount: { $size: "$subscriptions" }, // Count of subscriptions
        // learn mroe about the syntax of $cond
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscriber.subscriber"] }, // Check if user is in subscribers of the channel we are visiting
            then: true,
            else: false, // If not subscribed
          },
        },
      },
    },
    {
      $project: {
        // Project only the required fields
        username: 1,
        avatar: 1,
        cover: 1,
        subscribersCount: 1,
        subscriptionCount: 1,
        isSubscribed: 1,
        email: 1,
      },
    })
  ];

  if (!channel || channel.length === 0) {
    throw new apiError(404, "Channel not found");
  }

  res.status(200).json(
    new apiResponse(
      200,
      "Channel profile retrieved successfully",
      channel[0] // Since we are matching by username, we expect only one result
    )
  ); // Return the first channel found
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshUser,
  getUser,
  updateAvatar,
  getChannelProfile,
};
