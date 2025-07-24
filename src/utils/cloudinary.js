import { v2 } from "cloudinary";
import fs from "fs"; // file system module in node to handle file operations, read docs

v2.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      return null;
    }

    return (result = await v2.uploader.upload(filePath, {
      resource_type: "auto",
    }));
  } catch (error) {
    fs.unlinkSync(filePath); // delete the file from local storage if upload fails
    return null;
  }
};

export { uploadOnCloudinary };
