import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { fetchMyPets } from '../../services/petService';
import { pickAndUploadVideo } from '../../utils/imageUpload';
import cameraBg from '../../assets/images/cameraBg.png';
import profilePic from '../../assets/images/feedProfImage.png';
import leftArrow from '../../assets/images/arrow-left.png';

const PostVideoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>((route.params as any)?.videoUrl || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyPets()
      .then((list) => {
        setPets(list);
        if (list[0]) setSelectedPetId(list[0]._id);
      })
      .catch(() => setPets([]));
  }, []);

  const handlePickVideo = async () => {
    try {
      setUploading(true);
      const result = await pickAndUploadVideo('furmaa/posts');
      if (result?.url) setVideoUrl(result.url);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Video upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please login to post');
      return;
    }
    if (!caption.trim() && !videoUrl) {
      Alert.alert('Error', 'Add a caption or video');
      return;
    }
    setLoading(true);
    try {
      await api.CLIENT.post(api.ENDPOINTS.SOCIAL, {
        content: caption.trim() || 'Video post',
        videos: videoUrl ? [videoUrl] : [],
        images: [],
        pet: selectedPetId || undefined,
      });
      Alert.alert('Posted', 'Your video was shared', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={handlePickVideo} style={styles.videoPreviewContainer}>
          <Image source={cameraBg} style={styles.videoPreview} />
          {uploading && <ActivityIndicator style={styles.uploading} color="#FFF" />}
          <Text style={styles.uploadHint}>
            {videoUrl ? 'Video ready — tap to replace' : 'Tap to upload video'}
          </Text>
        </TouchableOpacity>
        <View style={styles.horizontalDivider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet Profile to Post Video</Text>
          {pets.length === 0 ? (
            <Text style={styles.emptyPets}>Add a pet in My Pets first (optional).</Text>
          ) : (
            <View style={styles.petProfilesContainer}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet._id}
                  style={[
                    styles.petProfileButton,
                    selectedPetId === pet._id && styles.petProfileButtonSelected,
                  ]}
                  onPress={() => setSelectedPetId(pet._id)}
                >
                  <Image
                    source={
                      pet.images?.[0] ? { uri: pet.images[0] } : profilePic
                    }
                    style={styles.petProfileImage}
                  />
                  <Text
                    style={[
                      styles.petProfileName,
                      selectedPetId === pet._id && styles.petProfileNameSelected,
                    ]}
                  >
                    {pet.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#9CA3AF"
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </ScrollView>

      <TouchableOpacity
        style={[styles.postButton, loading && styles.postButtonDisabled]}
        onPress={handlePost}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.postButtonText}>Post →</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backIcon: { width: 28, height: 28, tintColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSpacer: { width: 28 },
  content: { flex: 1, paddingHorizontal: 16 },
  videoPreviewContainer: { marginBottom: 16, alignItems: 'center' },
  videoPreview: { width: '100%', height: 200, borderRadius: 12 },
  uploading: { position: 'absolute', top: '40%' },
  uploadHint: { color: '#D1D5DB', marginTop: 8, fontSize: 13 },
  horizontalDivider: { height: 1, backgroundColor: '#374151', marginVertical: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  emptyPets: { color: '#9CA3AF', fontSize: 14 },
  petProfilesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  petProfileButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petProfileButtonSelected: { borderColor: '#FFFFFF' },
  petProfileImage: { width: 56, height: 56, borderRadius: 28 },
  petProfileName: { color: '#D1D5DB', marginTop: 6, fontSize: 13 },
  petProfileNameSelected: { color: '#FFFFFF', fontWeight: '600' },
  captionInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 100,
  },
  postButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#1F2E46',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  postButtonDisabled: { opacity: 0.6 },
  postButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default PostVideoScreen;
