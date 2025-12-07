import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //cloudinary File url
      reqiured: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean, //Is video is published or in draft mode
      deault: true,
    },
    duration: {
      type: Number, //cloudinary will give us duration of video in seconds
      required: true,
    },
  },
  { timestamps: true }
);
// Used to write the aggregate queries with pagination
videoSchema.plugin(mongooseAggregatePaginate);

export const Video =mongoose.model("videoShema",videoSchema)
// In mongo DB the Video is save as Videos