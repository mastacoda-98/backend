import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUser,
  updateAvatar,
  getChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  // this is middleware
  upload.fields([
    { name: "avatar", maxCount: 1 }, // 'avatar' is the field name for the file upload
    { name: "cover", maxCount: 1 }, // 'cover' is another field name for file upload (if needed)
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyToken, logoutUser);
router.route("/refreshToken").post(refreshUser);
router.route("/channel/:username").get(verifyToken, getChannelProfile);
router
  .route("/updateAvatar")
  .patch(verifyToken, upload.single("avatar"), updateAvatar);
router.route("/watchHistory").get(verifyToken, getWatchHistory);
export default router;
