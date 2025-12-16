import multer from "multer";

// cb-> callback
// this file is basically a destination where ur file from the frontend will store in the disk storage.
// And "./public /temp" this is the apth here the file will be stored temporarly before uploading it to cloudinary

// VERY IMPORTANT
// Multer does three core jobs:
//1: Intercepts the raw HTTP stream
//2: Parses multipart boundaries
//3: Separates text fields and file streams
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
    console.log(req);
  },

  filename: function (req, file, cb) {
    console.log("Hyyyy aakriti ", file);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage });
/* VERY IMPORTANT

This line:----------------------->

export const upload = multer({ storage });
------------------------------------->

Returns an object containing functions:
-------------------------------------------------
upload.single(fieldname)
upload.array(fieldname)
upload.fields(fieldsArray)
upload.none()
etc.

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
This all line of code is used to give the unique name to the file which is send by the user to the server before storing it to local storage .

  */
