import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { pickAndUploadImage, pickAndUploadVideo, pickMultipleImages } from '../../utils/imageUpload';
import { fetchMyPets } from '../../services/petService';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPets()
      .then(setPets)
      .catch(() => setPets([]));
  }, []);

  const pickImage = async () => {
    try {
      setUploading(true);
      const result = await pickAndUploadImage('furmaa/posts');
      if (result) {
        setImages([...images, result.url]);
        Alert.alert('Success', 'Image uploaded successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const pickVideo = async () => {
    try {
      setUploading(true);
      const result = await pickAndUploadVideo('furmaa/posts');
      if (result) {
        setVideos([...videos, result.url]);
        Alert.alert('Success', 'Video uploaded successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const pickMultipleImagesHandler = async () => {
    try {
      setUploading(true);
      const results = await pickMultipleImages('furmaa/posts');
      if (results && results.length > 0) {
        const urls = results.map(r => r.url);
        setImages([...images, ...urls]);
        Alert.alert('Success', `${results.length} image(s) uploaded successfully!`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    setVideos(newVideos);
  };

  const post = async () => {
    if (!content.trim() && images.length === 0 && videos.length === 0) {
      Alert.alert('Error', 'Please add some content, images, or videos to your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to create a post');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        content: content.trim(),
        images: images,
        videos: videos,
        pet: selectedPetId || undefined,
      };

      await api.CLIENT.post(api.ENDPOINTS.SOCIAL, payload);
      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity onPress={post} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FF6B6B" size="small" />
          ) : (
            <Text style={styles.postButton}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.profileImage || '👤'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Your Name'}</Text>
        </View>

        {pets.length > 0 && (
          <View style={styles.petSection}>
            <Text style={styles.petLabel}>Tag a pet (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.petChip, !selectedPetId && styles.petChipActive]}
                onPress={() => setSelectedPetId(null)}
              >
                <Text style={[styles.petChipText, !selectedPetId && styles.petChipTextActive]}>None</Text>
              </TouchableOpacity>
              {pets.map((pet) => {
                const id = pet._id || pet.id;
                const active = selectedPetId === id;
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.petChip, active && styles.petChipActive]}
                    onPress={() => setSelectedPetId(id)}
                  >
                    <Text style={[styles.petChipText, active && styles.petChipTextActive]}>
                      {pet.name || 'Pet'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
        />

        {/* Image Preview */}
        {images.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            <Text style={styles.mediaLabel}>Images ({images.length})</Text>
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <View key={`img-${index}`} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Video Preview */}
        {videos.length > 0 && (
          <View style={styles.mediaPreviewContainer}>
            <Text style={styles.mediaLabel}>Videos ({videos.length})</Text>
            <View style={styles.videoPreviewContainer}>
              {videos.map((uri, index) => (
                <View key={`vid-${index}`} style={styles.videoPreviewWrapper}>
                  <View style={styles.videoThumbnail}>
                    <Text style={styles.videoIcon}>▶️</Text>
                    <Text style={styles.videoLabel}>Video {index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeVideo(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upload Buttons */}
        <View style={styles.uploadButtonsContainer}>
          <TouchableOpacity 
            style={[styles.uploadButton, styles.imageButton]} 
            onPress={pickImage}
            disabled={uploading || loading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>📷 Add Photo</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.uploadButton, styles.videoButton]} 
            onPress={pickVideo}
            disabled={uploading || loading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>🎥 Add Video</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postButton: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  petSection: {
    marginBottom: 16,
  },
  petLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  petChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  petChipActive: {
    backgroundColor: '#FF6B6B',
  },
  petChipText: {
    fontSize: 14,
    color: '#333',
  },
  petChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    marginBottom: 20,
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 16,
    color: '#666',
  },
  mediaPreviewContainer: {
    marginBottom: 20,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  videoPreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  videoLabel: {
    fontSize: 12,
    color: '#666',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  imageButton: {
    backgroundColor: '#4CAF50',
  },
  videoButton: {
    backgroundColor: '#FF6B6B',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreatePostScreen;

