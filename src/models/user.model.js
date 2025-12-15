import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, //in db "  aakriti  " and "aakriti" are two different username but with trim both will be considered same
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    // Watch history is the array of video ids which user has watched previously
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    avatar: {
      type: String, //we store the photos and video on cloudnary service and we store the url of that store image and vdo here {cloudinary is a third party service to store media files}
      required: true,
    },
    coverImage: {
      type: String, //we store the photos and video on cloudnary service and we store the url of that store image and vdo here {cloudinary is a third party service to store media files}
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// using pre hook  to hash the password before saving the user document

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// this baseically used for checking the password enter by the user for lohgin is correct or not isPasswordCorrect send the true or false value

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Usinging jwt for generating access token and refresh token .All these methods present in mongoose
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Inmongo DB the User is save as Users
export const User = mongoose.model("User", userSchema);
