# Cloudinary Integration Guide

## ✅ Cloudinary Setup Complete!

Cloudinary ab fully integrated hai for image aur video uploads.

## 📋 Cloudinary Credentials

```
Cloud Name: dxehgyazg
API Key: 568244752896154
API Secret: aduNhJwbgaTBYXrL2UetXSu3MYO
```

## 🔧 Backend Setup

### 1. Environment Variables

Backend `.env` file me add karein:

```env
CLOUDINARY_CLOUD_NAME=dxehgyazg
CLOUDINARY_API_KEY=568244752896154
CLOUDINARY_API_SECRET=aduNhJwbgaTBYXrL2UetXSu3MYO
CLOUDINARY_URL=cloudinary://568244752896154:aduNhJwbgaTBYXrL2UetXSu3MYO@dxehgyazg
```

### 2. Upload Endpoints

- **POST `/api/upload/image`** - Single image upload
- **POST `/api/upload/images`** - Multiple images upload (max 10)
- **POST `/api/upload/video`** - Video upload
- **DELETE `/api/upload/:publicId`** - Delete file from Cloudinary

### 3. Request Format

#### Image Upload
```javascript
// FormData with file
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'image.jpg',
});
formData.append('folder', 'furmaa/products'); // Optional folder

// API Call
const response = await api.CLIENT.post(api.ENDPOINTS.UPLOAD.IMAGE, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Response
{
  success: true,
  image: {
    url: "https://res.cloudinary.com/dxehgyazg/image/upload/...",
    public_id: "furmaa/products/xyz123",
    width: 1000,
    height: 1000
  }
}
```

#### Video Upload
```javascript
const formData = new FormData();
formData.append('video', {
  uri: videoUri,
  type: 'video/mp4',
  name: 'video.mp4',
});
formData.append('folder', 'furmaa/videos');

const response = await api.CLIENT.post(api.ENDPOINTS.UPLOAD.VIDEO, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Response
{
  success: true,
  video: {
    url: "https://res.cloudinary.com/dxehgyazg/video/upload/...",
    public_id: "furmaa/videos/xyz123",
    duration: 120.5,
    format: "mp4"
  }
}
```

## 📱 Frontend Integration

### Admin Panel - Product Image Upload

```typescript
// AdminProductsScreen.tsx
const handleImageUpload = async (imageUri: string) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product.jpg',
    });
    formData.append('folder', 'furmaa/products');

    const response = await api.CLIENT.post(
      api.ENDPOINTS.UPLOAD.IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      // Use response.data.image.url in product
      setFormData({
        ...formData,
        images: [...formData.images, response.data.image.url],
      });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    Alert.alert('Error', 'Failed to upload image');
  }
};
```

### Admin Panel - Training Video Upload

```typescript
// AdminTrainingVideosScreen.tsx
const handleVideoUpload = async (videoUri: string) => {
  try {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'training-video.mp4',
    });
    formData.append('folder', 'furmaa/videos');

    const response = await api.CLIENT.post(
      api.ENDPOINTS.UPLOAD.VIDEO,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      // Use response.data.video.url in training video
      setFormData({
        ...formData,
        videoUrl: response.data.video.url,
      });
    }
  } catch (error) {
    console.error('Video upload error:', error);
    Alert.alert('Error', 'Failed to upload video');
  }
};
```

## 🎯 Cloudinary Folders Structure

```
furmaa/
  ├── products/          # Product images
  ├── videos/            # Training videos
  ├── thumbnails/        # Video thumbnails
  ├── profiles/          # User profile images
  ├── pets/              # Pet images
  └── posts/             # Social media posts
```

## 🔐 Security

- All upload endpoints require authentication (`protect` middleware)
- File size limits:
  - Images: 10MB
  - Videos: 100MB
- File type validation:
  - Images: Only image/* MIME types
  - Videos: Only video/* MIME types

## 📝 Usage Examples

### 1. Product Image Upload (Admin)
1. Admin selects image from gallery/camera
2. Image uploads to Cloudinary via `/api/upload/image`
3. Cloudinary returns secure URL
4. URL saved in product `images` array
5. Frontend displays image from Cloudinary URL

### 2. Training Video Upload (Admin)
1. Admin selects video from gallery/camera
2. Video uploads to Cloudinary via `/api/upload/video`
3. Cloudinary returns secure URL
4. URL saved in training video `videoUrl` field
5. Frontend plays video from Cloudinary URL

### 3. Multiple Images Upload
```typescript
const handleMultipleImages = async (imageUris: string[]) => {
  const formData = new FormData();
  imageUris.forEach((uri, index) => {
    formData.append('images', {
      uri,
      type: 'image/jpeg',
      name: `image-${index}.jpg`,
    });
  });
  formData.append('folder', 'furmaa/products');

  const response = await api.CLIENT.post(
    api.ENDPOINTS.UPLOAD.IMAGES,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  // response.data.images contains array of uploaded images
};
```

## 🚀 Benefits

1. **CDN Delivery**: Fast image/video loading worldwide
2. **Automatic Optimization**: Cloudinary optimizes images/videos automatically
3. **Transformations**: On-the-fly image transformations (resize, crop, etc.)
4. **Secure URLs**: HTTPS URLs for all uploads
5. **Scalable**: Handles large files and high traffic

## ✅ Testing

1. Test image upload from admin panel
2. Verify image displays correctly in product list
3. Test video upload for training videos
4. Verify video plays correctly in training screen
5. Test multiple images upload
6. Verify delete functionality

---

**Status**: ✅ Complete! Cloudinary fully integrated for image and video uploads.





