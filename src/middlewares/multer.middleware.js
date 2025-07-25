import multer from "multer"; //use to save file in local, read docs to use

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/"); // specify the directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // specify the file name
  },
});

const upload = multer({
  storage: storage,
});

export { upload };
