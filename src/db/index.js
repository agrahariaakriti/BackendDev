import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Mongo DB Connected successFully ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log(` MONGO DB CONNECTION FAILURE ERROR IS ${err}`);
    process.exit(1);
  }
};

export default connect_DB;
