import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/* 🔥 DEBUG CONSOLE — YAHAN LAGANA THA */
console.log("===== CLOUDINARY ENV DEBUG =====");
console.log("CLOUD NAME :", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY    :", process.env.CLOUDINARY_API_KEY);
console.log("API SECRET :", process.env.CLOUDINARY_API_SECRET);
console.log("================================");

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (!isCloudinaryConfigured) {
  console.warn("⚠️ Cloudinary ENV missing. Upload endpoints will not work until configured.");
}

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ensureCloudinaryConfigured = () => {
  if (isCloudinaryConfigured) return;
  throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env");
};

/* ================= IMAGE UPLOAD ================= */
export const uploadImage = (buffer, folder = "furmaa/products") => {
  ensureCloudinaryConfigured();
  console.log("👉 uploadImage() called");
  console.log("📂 folder:", folder);
  console.log("📦 buffer size:", buffer?.length);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1000, height: 1000, crop: "limit", quality: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            console.log("❌ CLOUDINARY ERROR:", error);
            return reject(error);
          }

          console.log("✅ CLOUDINARY UPLOAD SUCCESS");

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      )
      .end(buffer);
  });
};

/* ================= VIDEO UPLOAD ================= */
export const uploadVideo = (buffer, folder = "furmaa/videos") => {
  ensureCloudinaryConfigured();
  console.log("👉 uploadVideo() called");

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "video",
          quality: "auto",
        },
        (error, result) => {
          if (error) {
            console.log("❌ CLOUDINARY VIDEO ERROR:", error);
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration,
            format: result.format,
          });
        }
      )
      .end(buffer);
  });
};

/* ================= DELETE ================= */
export const deleteFile = async (publicId) => {
  ensureCloudinaryConfigured();
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
