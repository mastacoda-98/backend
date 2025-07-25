import { v2 } from "cloudinary";
import fs from "fs"; // file system module in node to handle file operations, read docs
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

v2.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      console.error("File path is required for upload");
      return null;
    }

    const kek = await v2.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return kek;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(filePath); // Delete the file from local storage if upload fails
    return null;
  }
};

export { uploadOnCloudinary };
