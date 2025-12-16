import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
// import { User } from "../models/user.model.js";

const UpdateProfileOrAvatar = asyncHandler(async (req, res) => {
  //
  //
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const user = req.user;

  if (!avatarLocalPath && !coverImageLocalPath) {
    throw new ApiError(400, "Image or coverImage Must needed");
  }
  // else we upload to cloudinary
  let avatarCloudinaryPath = "";
  let coverImageCloudinaryPath = "";

  // Fisrt checking and changing for avatar
  if (avatarLocalPath) {
    avatarCloudinaryPath = await uploadOnCloudinary(avatarLocalPath);

    if (!avatarCloudinaryPath?.url) {
      throw new ApiError(400, "Fail to Upload Avatar");
    }
    if (user.avatar.avatar_public_id)
      await deleteFromCloudinary(user.avatar.avatar_public_id);

    user.avatar.url = avatarCloudinaryPath.url;
    user.avatar.avatar__public_id = avatarCloudinaryPath.public_id;
  }
  // Now check for coverImage
  if (coverImageLocalPath) {
    coverImageCloudinaryPath = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImageCloudinaryPath?.url) {
      throw new ApiError(400, "Cannot Update the Profile Image");
    }
    if (user.coverImage.coverImage_public_id) {
      await deleteFromCloudinary(user.coverImage.coverImage_public_id);
    }

    user.coverImage.url = coverImageCloudinaryPath.url;
    user.coverImage.coverImage__public_id = coverImageCloudinaryPath.public_id;
  }

  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "File updated successfully"));
});

// this is default export
export default UpdateProfileOrAvatar;
