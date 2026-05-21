import express from "express";
import { uploadImage, uploadVideo, deleteFile } from "../config/cloudinary.js";
import { imageUpload, videoUpload } from "../middleware/upload.middleware.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ================= SINGLE IMAGE ================= */
router.post(
  "/image",
  protect,
  imageUpload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image provided",
        });
      }

      const folder = req.body.folder || "furmaa/products";
      const result = await uploadImage(req.file.buffer, folder);

      res.json({
        success: true,
        image: result,
        url: result.url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* ================= MULTIPLE IMAGES ================= */
router.post(
  "/images",
  protect,
  imageUpload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images provided",
        });
      }

      const folder = req.body.folder || "furmaa/products";

      const uploads = req.files.map((file) =>
        uploadImage(file.buffer, folder)
      );

      const results = await Promise.all(uploads);

      res.json({
        success: true,
        images: results,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* ================= VIDEO ================= */
router.post(
  "/video",
  protect,
  videoUpload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video provided",
        });
      }

      const folder = req.body.folder || "furmaa/videos";
      const result = await uploadVideo(req.file.buffer, folder);

      res.json({
        success: true,
        video: result,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* ================= DELETE ================= */
router.delete("/:publicId", protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    await deleteFile(publicId);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
