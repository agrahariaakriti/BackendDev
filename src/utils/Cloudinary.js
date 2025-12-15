import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/*Step 1: User uploads file
Frontend sends file as multipart/form-data.
-------------------------------------------------
Step 2: Multer receives file
Multer saves it temporarily on server (e.g., uploads/file.png).
-------------------------------------------------
Step 3: Get temp file path
Backend reads req.file.path.
-------------------------------------------------
Step 4: Upload to Cloudinary
Send that local file to Cloudinary.
-------------------------------------------------
Step 5: Cloudinary returns URL
You get secure_url (public link).
-----------------------------------------------------
Step 6: Delete temp file
Use fs.unlinkSync() to remove the local file.
--------------------------------------------------
Step 7: Save Cloudinary URL
Store the URL in MongoDB, not the file itself.*/
// ****************************************************

//We are doing the cogiguratio :->To connect your backend to your Cloudinary account so you can upload files.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      // console.log("THE PATH NOT FOUND BYEEEEE");
      return null;
    } else {
      // upload the file to cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
        resourse_type: "auto",
      });
      // file has bee uploaded suceessfully
      console.log(`file uploaded on cloudinary ${response.secure_url}`);
      fs.unlinkSync(localFilePath);
      return response;
    }
  } catch (error) {
    // Iff file not uplaoded successfull Then throw the error.Like if file not uplaoded successfull due to netwrok issue or any other issue.So we delete the local file anyway

    fs.unlinkSync(localFilePath); //remove the loally save temp file as the uploaded operation get failed

    return null;
  }
};

export { uploadOnCloudinary };
