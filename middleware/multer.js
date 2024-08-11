const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

const convertToWebp = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const buffer = await sharp(req.file.buffer).resize({ width: 600, height: 600, fit: "inside" }).webp({ quality: 80 }).toBuffer();
    const name = req.file.originalname.split(" ").join("_");
    const newFilename = name + Date.now() + ".webp";
    const filePath = path.join("images", newFilename);
    fs.writeFileSync(filePath, buffer);
    req.file.path = filePath;
    req.file.filename = newFilename;
    req.file.mimetype = "image/webp";
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, convertToWebp };