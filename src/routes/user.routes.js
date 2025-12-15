import { Router } from "express";
import {
  LoggOutUser,
  LoginUser,
  registerUser,
  refreshAccessToken,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
// This ishow middle ware are injected.Here multer taking all the file to the disk storage
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(LoginUser);

// inject middleware verifyjwt middleware
router.route("/logout").post(verifyJWT, LoggOutUser);

//
router.route("/refresh-token").post(refreshAccessToken);
export default router;
