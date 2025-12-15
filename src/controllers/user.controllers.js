import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Gerenarting the access and refresh token seperatly
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const user_accessToken = await user.generateAccessToken();
    const user_refreshToken = await user.generateRefreshToken();
    // After gneretaing token we store the refresh token to mondoose db and the time we save any thing to db.The mongoose model kick in thats we it start validating the field. So for that we write as { validateBeforeSave: false } .... Means dont validate it before save this.

    user.refreshToken = user_refreshToken;
    await user.save({ validateBeforeSave: false });

    //After this we writen the access token and refresh token

    return { user_accessToken, user_refreshToken };
  } catch (erroe) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
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

  const { fullName, username, email, password } = req.body;
  console.log("HELLO THE RESPONCE ARE", req.body);

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

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(409, "User Already exist");
  }

  // Handling images.The Multer has store the file inti the disk storage
  // It retrieves the file path of the uploaded avatar, but only if req.files.avatar[0]

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required");
  } else {
    // upload to cloudinary
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatarCloudinary) {
      throw new ApiError(400, "The Avatar image is important");
    }
    // Now store the avatarCloudinary and coverImageCloudinary in the database

    const user = await User.create({
      fullName,
      avatar: avatarCloudinary.url,
      coverImage: coverImageCloudinary?.url || "",
      username: username.toLowerCase(),
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
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User register successfully"));
  }
  // Now we have to upload to cloudinary

  // return res.status(400).json({ message: "OKK" });
});

const LoginUser = asyncHandler(async (req, res) => {
  // STEP FOR LOGIN
  // Step 1: we ask for credential (req.body)
  // step 2 : Check i the username or email is present or not
  // step 3 : If User found then we have to check if pass is correct of not
  // Step 4: if password matches User get login.We send the access na d refresh token both to user
  // step 5 : send these token in the cookies
  // console.log(req.cookies);
  console.log(req.user);

  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, " Username or email required");
  }
  // Search the user with username or email
  const user_Search = await User.findOne({
    $or: [{ email }, { username }],
  });

  // User not found
  if (!user_Search) {
    throw new ApiError(400, "User not found");
  }
  // Now check password . The user_Search is the instane of the user model and in that model we have all these method available

  const isPasswordValid = await user_Search.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Invalid");
  }

  // We get the access and refresh token from generateAccessAndRefreshTokens function.
  const { user_accessToken, user_refreshToken } =
    await generateAccessAndRefreshTokens(user_Search._id);

  // We getting the logged in user who have the refresh token.Dont give password and refresh token

  const loggedInUser = await User.findById(user_Search._id).select(
    "-password -refreshToken"
  );

  // For stending cookies we have to design the options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", user_accessToken, options)
    .cookie("refreshToken", user_refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          user_accessToken,
          user_refreshToken,
        },
        "User loggedin successFull"
      )
    );

  // Now if user ils valid then generate the acccess and refresh token
});

// on logged Out we do 2 thing
// 1:- Delete refresh token from DB
// 2:- Clear cookies from browser

const LoggOutUser = async (req, res) => {
  // as we have added the user in the req so Now at this point we have the access of the user
  const userId = req.user._id;
  // Now i gt the id from id we go to db and delete the refresh token
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {
      message: "User logged Out SuccessFully",
    });
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "Unorthorized request");
  }
  // After getting this refresh token we need to vertify this token.
  const decodedAcessToken = jwt.verify(
    incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  try {
    const userId = decodedAcessToken._id;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "Invalid Refresh Token");
    }
    // Now we have to match the incomming Refresh token and stored refresh token .
    const storRefreshToken = user.refreshToken;

    if (storRefreshToken != incommingRefreshToken)
      throw new ApiError(401, "Refresh Token is expired or used");

    // Other wise we generate the new access and refresh token
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { new_user_accessToken, new_user_refreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", new_user_accessToken, options)
      .cookie("refreshToken", new_user_refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { new_user_accessToken, new_user_refreshToken },
          "Access Token send success fully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token  ");
  }
});

// For changeing the password.Like if user is trying to change the password so definitly he/she must be login priviously . And in my login code i have save user in the req.body. Go and check it out .
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log("hyy parbhu ", req.body);
  console.log("hyy parbhu ", req.user);

  const { oldPassword, newPassword } = req.body;
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "In Correct password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(
    new ApiResponse(200, {
      message: "Password change SucessFully",
    })
  );
});

export {
  registerUser,
  LoginUser,
  LoggOutUser,
  refreshAccessToken,
  changeCurrentPassword,
};
