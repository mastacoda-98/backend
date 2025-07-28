import { Router } from "express";
import {
  getUser,
  loginUser,
  logoutUser,
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
  getUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyToken, logoutUser);

export default router;
