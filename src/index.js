import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});
import connect_DB from "./db/index.js";
import { app } from "./app.js";

// After connection establish then only over server start listening in the callback of connect_DB function
connect_DB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`The server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Connection failed ${err}`);
  });

// My first approcah to connect Database
/*import exprss from "express";

const app = express()(async () => {
  try {
    // wait till the connection does not get establishd

    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

// on(eventName, callback) registers a function that runs when that event happens.Here error are the name of the listener and callback is the function that will be called when the event occurs.

    app.on("error", (err) => {
      console.log("Error in connecting to the database");
      throw err;
    });

    app.listen(process.env.PORT,() => {
      console.log(
        `The conection stablish and app is listening on port ${process.env.PORT}`
      );
    });
  }
  catch (err) {
    console.log(`The error is ${err}`);
  }
})();
*/
