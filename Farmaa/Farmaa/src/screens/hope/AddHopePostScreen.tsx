import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { pickAndUploadImage } from '../../utils/imageUpload';
import { getCurrentLocationString } from '../../utils/geolocation';
import leftArrow from '../../assets/images/arrow-left.png';
import petImage from '../../assets/images/pet.png';
import galleryIcon from '../../assets/images/gallery.png';
import gpsIcon from '../../assets/images/gps.png';

const MAX_IMAGES = 4;

export default function PostScreen({ }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [postType, setPostType] = useState<'adoption' | 'lostFound'>('adoption');
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const initialLoc = (route.params as any)?.selectedLocation || user?.address?.city || '';
  const [location, setLocation] = useState(initialLoc);
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<(string | null)[]>([null, null, null, null]);

  useEffect(() => {
    const fromParams = (route.params as any)?.selectedLocation;
    if (fromParams) setLocation(fromParams);
    else if (user?.address?.city && !location) setLocation(user.address.city);
  }, [user, (route.params as any)?.selectedLocation]);

  const canPost = !!petName.trim() && !!petAge.trim() && !!location.trim();

  const handlePickImage = async (index: number) => {
    const result = await pickAndUploadImage('furmaa/hope');
    if (result?.url) {
      setImageUrls((prev) => {
        const next = [...prev];
        next[index] = result.url;
        return next;
      });
    }
    setUploadingIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const addr = await getCurrentLocationString();
      setLocation(addr || location);
    } catch (e: any) {
      const isDenied = e?.code === 1 || (e?.message && /denied|permission/i.test(e?.message || ''));
      Alert.alert(
        'Location',
        isDenied
          ? 'Location access denied. Enable in Settings or type location above.'
          : (e?.message || 'Could not get location. Type your city/area above.')
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePost = async () => {
    if (!canPost || !user) {
      Alert.alert('Error', 'Please fill all required fields and login to create post');
      return;
    }

    try {
      setLoading(true);

      const uploadedUrls = imageUrls.filter((u): u is string => !!u);

      const postData = {
        postType,
        petType,
        petName: petName.trim(),
        petAgeText: petAge.trim(),
        locationText: location.trim(),
        description: description.trim() || undefined,
        images: uploadedUrls.length ? uploadedUrls : undefined,
      };

      const response = await api.CLIENT.post(`${api.ENDPOINTS.HOPE}/posts`, postData);

      if (response.data?.post) {
        Alert.alert('Success', 'Post created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to create hope post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Select Pet Type */}
        <Text style={styles.sectionTitle}>Select Pet Type</Text>
        <View style={styles.row}>
          <Pill label="Dog" icon={petImage} active={petType === 'dog'} onPress={() => setPetType('dog')} />
          <Pill label="Cat" icon={petImage} active={petType === 'cat'} onPress={() => setPetType('cat')} />
        </View>

        {/* Select Post Type */}
        <Text style={styles.sectionTitle}>Select Post Type</Text>
        <View style={styles.row}>
          <AgePill label="Adoption" active={postType === 'adoption'} onPress={() => setPostType('adoption')} />
          <AgePill label="Lost & Found" active={postType === 'lostFound'} onPress={() => setPostType('lostFound')} />
        </View>

        {/* Upload Images - user se pick karke upload */}
        <Text style={styles.sectionTitle}>Upload Image (Up to 4)</Text>
        <View style={styles.imageRow}>
          {[0, 1, 2, 3].map((i) => {
            const url = imageUrls[i];
            const isUploading = uploadingIndex === i;
            return (
              <TouchableOpacity
                key={i}
                style={styles.uploadBox}
                onPress={() => {
                  if (url) return;
                  setUploadingIndex(i);
                  handlePickImage(i);
                }}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#1F2E46" />
                ) : url ? (
                  <>
                    <Image source={{ uri: url }} style={styles.uploadedImage} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => handleRemoveImage(i)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Image source={galleryIcon} style={styles.uploadIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pet Name */}
        <Text style={styles.sectionTitle}>Pet Name</Text>
        <TextInput
          placeholder="Enter Pet Name"
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          value={petName}
          onChangeText={setPetName}
        />

        {/* Location - same format as Hope list (current / manual) */}
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationRow}>
          <TextInput
            placeholder="e.g. Noida, Uttar Pradesh or Jaipur, Rajasthan"
            style={styles.locationInput}
            placeholderTextColor="#9CA3AF"
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity
            style={[styles.useCurrentLocBtn, locationLoading && styles.useCurrentLocBtnDisabled]}
            onPress={handleUseCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator size="small" color="#1F2E46" />
            ) : (
              <Image source={gpsIcon} style={styles.gpsIcon} />
            )}
            <Text style={styles.useCurrentLocText}>
              {locationLoading ? 'Getting...' : 'Use current'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Age */}
        <Text style={styles.sectionTitle}>How old is your pet?</Text>
        <View style={styles.rowWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:10}}>
          {['6 Months', '1 Year', '2 Year', '3 Year', '4 Year','5 Year'].map(item => (
            <AgePill
              key={item}
              label={item}
              active={petAge === item}
              onPress={() => setPetAge(item)}
            />
          ))}
          </ScrollView>
        </View>

        {/* Pet Details */}
        <Text style={styles.sectionTitle}>Pet Details</Text>
        <TextInput
          placeholder="Enter Pet Details"
          style={styles.textArea}
          multiline
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
        />

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, (!canPost || loading) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!canPost || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postText}>Post</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

/* ---------------- Components ---------------- */

type PillProps = {
  label: string;
  active: boolean;
  icon: any; 
  onPress: () => void;
};


const Pill = ({ label, icon, active, onPress }: PillProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}
    activeOpacity={0.8}
  >
    <View style={styles.pillContent}>
      <Image source={icon} style={styles.pillIcon} />
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

type AgePillProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const AgePill = ({ label, active, onPress }: AgePillProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.agePill, active && styles.ageActive]}
  >
    <Text style={[styles.ageText, active && styles.ageTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  back: { height: 30, width: 30, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  content: { padding: 20, paddingBottom: 40 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    marginTop: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#1F2E46',
  },
  pillText: { fontWeight: '600', color: '#000000' },
  pillTextActive: { color: '#FFFFFF' },
pillContent: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 6,
},

pillIcon: {
  resizeMode: 'contain',
},
  imageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  uploadBox: {
    flex: 1,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  uploadIcon: { width: 22, height: 22, resizeMode: 'contain' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  useCurrentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  useCurrentLocBtnDisabled: { opacity: 0.7 },
  gpsIcon: { width: 20, height: 20, resizeMode: 'contain' },
  useCurrentLocText: { fontSize: 12, fontWeight: '600', color: '#1F2E46' },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 18,
  },

  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  agePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  ageActive: { backgroundColor: '#1F2E46' },
  ageText: { fontSize: 13, fontWeight: '600' },
  ageTextActive: { color: '#FFFFFF' },

  textArea: {
    height: 110,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
  },

  postButton: {
    marginTop: 30,
    backgroundColor: '#1F2E46',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.8,
  },
  postText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});