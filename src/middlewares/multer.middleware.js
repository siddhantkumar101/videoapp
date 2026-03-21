import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/temp"); // ✅ FIX

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log("MULTER RUNNING ✅"); // debug

    cb(null, dir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // ✅ avoid overwrite
  }
});

export const upload = multer({ storage });