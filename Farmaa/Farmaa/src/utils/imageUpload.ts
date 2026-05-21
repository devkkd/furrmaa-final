import { Platform, Alert } from 'react-native';
import api from '../config/api';

interface UploadResult {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
}

function parseUploadResponse(data: any): UploadResult | null {
  if (!data?.success) return null;
  const img = data.image;
  const url =
    data.url || (typeof img === 'string' ? img : img?.url || img?.secure_url);
  if (!url) return null;
  return {
    url,
    public_id: typeof img === 'object' ? img?.public_id : undefined,
    width: typeof img === 'object' ? img?.width : undefined,
    height: typeof img === 'object' ? img?.height : undefined,
  };
}

// Lazy load react-native-image-picker to avoid native module errors at import time
let imagePickerModule: any = null;

const getImagePicker = () => {
  if (imagePickerModule === null) {
    try {
      imagePickerModule = require('react-native-image-picker');
    } catch (error) {
      console.warn('react-native-image-picker not available:', error);
      imagePickerModule = false; // Mark as unavailable
    }
  }
  return imagePickerModule;
};

export const pickAndUploadImage = async (
  folder: string = 'furmaa/products'
): Promise<UploadResult | null> => {
  const imagePicker = getImagePicker();
  
  // Fallback if native module not available
  if (!imagePicker || imagePicker === false) {
    Alert.alert(
      'Image Picker Not Available',
      'Please rebuild the app to enable image upload from gallery. For now, you can manually enter image URLs in the URL field.',
      [{ text: 'OK' }]
    );
    return null;
  }

  return new Promise((resolve) => {
    imagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      },
      async (response: any) => {
        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          resolve(null);
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const uri = asset.uri;

          if (!uri) {
            Alert.alert('Error', 'No image selected');
            resolve(null);
            return;
          }

          try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('image', {
              uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
              type: asset.type || 'image/jpeg',
              name: asset.fileName || 'image.jpg',
            });
            formData.append('folder', folder);

            const uploadResponse = await api.CLIENT.post(
              api.ENDPOINTS.UPLOAD.IMAGE,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            const parsed = parseUploadResponse(uploadResponse.data);
            if (parsed) {
              resolve(parsed);
            } else {
              Alert.alert('Error', 'Failed to upload image');
              resolve(null);
            }
          } catch (error: any) {
            console.error('Image upload error:', error);
            Alert.alert(
              'Upload Error',
              error.response?.data?.message || 'Failed to upload image'
            );
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const pickAndUploadVideo = async (
  folder: string = 'furmaa/videos'
): Promise<UploadResult | null> => {
  const imagePicker = getImagePicker();
  
  // Fallback if native module not available
  if (!imagePicker || imagePicker === false) {
    Alert.alert(
      'Video Picker Not Available',
      'Please rebuild the app to enable video upload from gallery. For now, you can manually enter video URLs in the URL field.',
      [{ text: 'OK' }]
    );
    return null;
  }

  return new Promise((resolve) => {
    imagePicker.launchImageLibrary(
      {
        mediaType: 'video',
        quality: 0.8,
        videoQuality: 'high',
      },
      async (response: any) => {
        if (response.didCancel) {
          resolve(null);
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          resolve(null);
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          const uri = asset.uri;

          if (!uri) {
            Alert.alert('Error', 'No video selected');
            resolve(null);
            return;
          }

          try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('video', {
              uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
              type: asset.type || 'video/mp4',
              name: asset.fileName || 'video.mp4',
            });
            formData.append('folder', folder);

            const uploadResponse = await api.CLIENT.post(
              api.ENDPOINTS.UPLOAD.VIDEO,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );

            if (uploadResponse.data.success) {
              resolve(uploadResponse.data.video);
            } else {
              Alert.alert('Error', 'Failed to upload video');
              resolve(null);
            }
          } catch (error: any) {
            console.error('Video upload error:', error);
            Alert.alert(
              'Upload Error',
              error.response?.data?.message || 'Failed to upload video'
            );
            resolve(null);
          }
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const pickMultipleImages = async (
  folder: string = 'furmaa/products'
): Promise<UploadResult[]> => {
  const imagePicker = getImagePicker();
  
  // Fallback if native module not available
  if (!imagePicker || imagePicker === false) {
    Alert.alert(
      'Image Picker Not Available',
      'Please rebuild the app to enable multiple image upload. For now, you can manually enter image URLs.',
      [{ text: 'OK' }]
    );
    return [];
  }

  return new Promise((resolve) => {
    imagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        selectionLimit: 10,
      },
      async (response: any) => {
        if (response.didCancel) {
          resolve([]);
          return;
        }

        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
          resolve([]);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uploadPromises = response.assets.map(async (asset: any) => {
            const uri = asset.uri;
            if (!uri) return null;

            try {
              const formData = new FormData();
              formData.append('image', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: asset.type || 'image/jpeg',
                name: asset.fileName || 'image.jpg',
              });
              formData.append('folder', folder);

              const uploadResponse = await api.CLIENT.post(
                api.ENDPOINTS.UPLOAD.IMAGE,
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }
              );

              return parseUploadResponse(uploadResponse.data);
            } catch (error: any) {
              console.error('Image upload error:', error);
              return null;
            }
          });

          const results = await Promise.all(uploadPromises);
          resolve(results.filter((r) => r !== null) as UploadResult[]);
        } else {
          resolve([]);
        }
      }
    );
  });
};
