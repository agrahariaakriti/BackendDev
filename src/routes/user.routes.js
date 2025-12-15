import { Router } from "express";
import {
  LoggOutUser,
  LoginUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();
// This ishow middle ware are injected.Here multer taking all the file to the disk storage.Without multer we have form data.And form data is not understand by express so multer wrap the form data and give you req.body and req.files
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


// req exists only for ONE HTTP request
// After the response is sent → req is destroyed
// Next API call = brand new req object
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

export default router;
