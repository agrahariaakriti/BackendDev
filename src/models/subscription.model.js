import { timeStamp } from "console";
import { subscribe } from "diagnostics_channel";
import mongoose from "mongoose";

const subscription = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, //One who is subscribing
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId, //this represents the user who is being subscribed to.
      ref: "User",
    },
  },
  { timeStamp: true }
);

export const Subscription = mongoose.model("Subscription", subscription);

// The first argument "Subscription" is the collection(Table) name. Mongoose automatically pluralizes it, so the actual MongoDB collection will likely be called subscriptions.