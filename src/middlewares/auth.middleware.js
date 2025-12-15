// This middle ware varfies that is their is user or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    //  The access token can come from two places:
    // A: Cookies (browser apps)
    //  B: Authorization header (mobile / API clients)

    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unorthorizsed User");
    }
    // After   taking the token

    const deCodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Dtatabase query.User still exists
    //1:- User is not banned
    //2:- Account not deleted
    //3:-  So you verify user still exists.

    const user = await User.findById(deCodedToken?._id).select("-refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Aceess Token");
    }
    // adding new user object to req.So that in loggedOut function we can get this user info there
    // req.user = user;
    // This is the MOST IMPORTANT LINE.
    // Because downstream code needs to know:
    // Who is making this request?
    // Which user is logged in?

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access");
  }
});

export default verifyJWT;

// Refresh token only used to generate the access token
// Refresh token are not sent every request thats not save bcoz
// If stolen → attacker has access for DAYS
// Access tokens expire quickly → damage limited
