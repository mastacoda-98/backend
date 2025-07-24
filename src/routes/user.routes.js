import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.route("/register").post(
  // this is middleware
  upload.fields([
    { name: "avatar", maxCount: 1 }, // 'avatar' is the field name for the file upload
    { name: "cover", maxCount: 1 }, // 'cover' is another field name for file upload (if needed)
  ]),
  getUser
);

export default router;
