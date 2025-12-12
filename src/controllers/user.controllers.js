import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // Registration logic here
  // step 1 : Get detai from user from frontend
  // step 2: validation of data
  // step 3 : Check if user already exist(by using email or username )
  // step 4 : check if avatar is their and image picture
  // step 5: If present then  upload them to cloudinary
  //step 6 :  create user object(Bcoz mongo db mein object hi banay jata hai) - create entry in db
  // step 7 : Remove pasword and refresh token feild from response
  // step 8: check for useer creatation
  // step 9 : return response

  // All detail come from the body we get it as req.body

  const { fullName, username, email, password, coverImage } = req.body;

  // validation code
  if (
    [fullName, email, username, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "fullname is required");
  }
  // Now we check user exist or not
  //  Find a user where:
  // email === "test@gmail.com"
  // OR
  // username === "akriti123"

  const existedUser = findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(409, "User Already exist");
  }

  // Handling images.The Multer has store the file inti the disk storage
  // It retrieves the file path of the uploaded avatar, but only if req.files.avatar[0]

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required");
  } else {
    // upload to cloudinary
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarCloudinary) {
      throw new ApiError(400, "The Avtar image is important");
    }
    // Now store the avatarCloudinary and coverImageCloudinary in the database

    const user = await User.create({
      fullName,
      avatar: avatarCloudinary.url,
      coverImage: coverImageCloudinary?.url || "",
      username: username.toLowercase,
      password,
      email,
    });

    // We check if  user has formed or not successfully

    // Her Fetch user by ID without password and refreshToken.
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong will registoring the user");
    }
    // Now if user has been created successfuly the sed every thing in responce
  }
  // Now we have to upload to cloudinary
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User register successfully"));

  // return res.status(400).json({ message: "OKK" });
});

export { registerUser };
