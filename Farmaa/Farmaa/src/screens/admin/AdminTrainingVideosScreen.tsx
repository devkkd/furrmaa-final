import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';
import { pickAndUploadVideo, pickAndUploadImage } from '../../utils/imageUpload';

interface TrainingVideo {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  category: string;
  petType: string[];
  duration: number;
  level: string;
  instructorName?: string;
  instructorTitle?: string;
  instructorBio?: string;
  instructorExperience?: number;
  instructorImage?: string;
  instructorSpecialization?: string;
  courseDuration?: string;
  lessonsCount?: number;
  quizzesCount?: number;
  difficulty?: string;
  order: number;
  isActive: boolean;
  isPremium: boolean;
  isFree: boolean;
}

const AdminTrainingVideosScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'update' | 'delete'>('list');
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    category: 'basic',
    petType: ['both'],
    duration: '',
    level: 'beginner',
    instructorName: '',
    instructorTitle: '',
    instructorBio: '',
    instructorExperience: '',
    instructorImage: '',
    instructorSpecialization: '',
    courseDuration: '',
    lessonsCount: '',
    quizzesCount: '',
    difficulty: 'Easy',
    order: '',
    isActive: true,
    isPremium: false,
    isFree: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'update' || activeTab === 'delete') {
      fetchVideos();
    }
  }, [activeTab]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.TRAINING_VIDEOS);
      setVideos(response.data.videos || []);
    } catch (err: any) {
      console.error('Failed to fetch training videos:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load training videos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      category: 'basic',
      petType: ['both'],
      duration: '',
      level: 'beginner',
      instructorName: '',
      instructorTitle: '',
      instructorBio: '',
      instructorExperience: '',
      instructorImage: '',
      instructorSpecialization: '',
      courseDuration: '',
      lessonsCount: '',
      quizzesCount: '',
      difficulty: 'Easy',
      order: '',
      isActive: true,
      isPremium: false,
      isFree: false,
    });
    setEditingId(null);
  };

  const handleAddVideo = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.videoUrl.trim()) {
      Alert.alert('Error', 'Title, description, and video URL are required');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category (Basic, Intermediate, or Advanced)');
      return;
    }

    setLoading(true);
    try {
      // Auto-set isFree based on category
      const isFree = formData.category === 'basic';
      
      const payload = {
        ...formData,
        petType: Array.isArray(formData.petType) ? formData.petType : [formData.petType],
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
        instructorExperience: parseInt(formData.instructorExperience) || 0,
        lessonsCount: parseInt(formData.lessonsCount) || 0,
        quizzesCount: parseInt(formData.quizzesCount) || 0,
        isFree: isFree, // Basic = free, others = premium
        isPremium: !isFree, // Intermediate/Advanced = premium
      };
      
      const response = await api.CLIENT.post(api.ENDPOINTS.ADMIN.TRAINING_VIDEOS, payload);
      Alert.alert(
        'Success', 
        `Training video added successfully!\nCategory: ${formData.category.toUpperCase()}\n${isFree ? 'Free Video' : 'Premium Video'}`
      );
      resetForm();
      setActiveTab('list');
      fetchVideos();
    } catch (err: any) {
      console.error('Add video error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  const handleEditVideo = (video: TrainingVideo) => {
    setEditingId(video._id);
    setFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || '',
      category: video.category,
      petType: video.petType || ['both'],
      duration: String(video.duration || ''),
      level: video.level || 'beginner',
      instructorName: video.instructorName || '',
      instructorTitle: video.instructorTitle || '',
      instructorBio: video.instructorBio || '',
      instructorExperience: String(video.instructorExperience || ''),
      instructorImage: video.instructorImage || '',
      instructorSpecialization: video.instructorSpecialization || '',
      courseDuration: video.courseDuration || '',
      lessonsCount: String(video.lessonsCount || ''),
      quizzesCount: String(video.quizzesCount || ''),
      difficulty: video.difficulty || 'Easy',
      order: String(video.order || ''),
      isActive: video.isActive !== undefined ? video.isActive : true,
      isPremium: video.isPremium || false,
      isFree: video.isFree || false,
    });
    setActiveTab('update');
  };

  const handleUpdateVideo = async () => {
    if (!editingId) return;
    if (!formData.title.trim() || !formData.description.trim() || !formData.videoUrl.trim()) {
      Alert.alert('Error', 'Title, description, and video URL are required');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a category (Basic, Intermediate, or Advanced)');
      return;
    }

    setLoading(true);
    try {
      // Auto-set isFree based on category
      const isFree = formData.category === 'basic';
      
      const payload = {
        ...formData,
        petType: Array.isArray(formData.petType) ? formData.petType : [formData.petType],
        duration: parseInt(formData.duration) || 0,
        order: parseInt(formData.order) || 0,
        instructorExperience: parseInt(formData.instructorExperience) || 0,
        lessonsCount: parseInt(formData.lessonsCount) || 0,
        quizzesCount: parseInt(formData.quizzesCount) || 0,
        isFree: isFree, // Basic = free, others = premium
        isPremium: !isFree, // Intermediate/Advanced = premium
      };
      
      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.TRAINING_VIDEOS}/${editingId}`, payload);
      Alert.alert(
        'Success', 
        `Training video updated successfully!\nCategory: ${formData.category.toUpperCase()}\n${isFree ? 'Free Video' : 'Premium Video'}`
      );
      resetForm();
      setActiveTab('list');
      fetchVideos();
    } catch (err: any) {
      console.error('Update video error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this training video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.TRAINING_VIDEOS}/${videoId}`);
              Alert.alert('Success', 'Training video deleted successfully');
              fetchVideos();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete video');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVideoItem = ({ item }: { item: TrainingVideo }) => {
    const categoryColors: { [key: string]: string } = {
      basic: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#8B5CF6',
    };
    const categoryEmojis: { [key: string]: string } = {
      basic: '🆓',
      intermediate: '⭐',
      advanced: '👑',
    };
    
    return (
      <View style={styles.videoCard}>
        <View style={styles.videoInfo}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle}>{item.title}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors[item.category] || '#6B7280' }]}>
              <Text style={styles.categoryBadgeText}>
                {categoryEmojis[item.category] || ''} {item.category.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.videoDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.videoMeta}>
            <Text style={styles.videoMetaText}>Duration: {item.duration} min</Text>
            <Text style={styles.videoMetaText}>Level: {item.level}</Text>
            <Text style={styles.videoMetaText}>Pet Type: {Array.isArray(item.petType) ? item.petType.join(', ') : item.petType}</Text>
            {item.isFree && <Text style={[styles.videoMetaText, { color: '#10B981', fontWeight: 'bold' }]}>🆓 FREE</Text>}
            {item.isPremium && <Text style={[styles.videoMetaText, { color: '#F59E0B', fontWeight: 'bold' }]}>⭐ PREMIUM</Text>}
          </View>
          {item.instructorName && (
            <Text style={styles.instructorName}>Instructor: {item.instructorName}</Text>
          )}
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditVideo(item)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteVideo(item._id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && videos.length === 0 && activeTab === 'list') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading training videos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Training Videos</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={styles.tabText}>List Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.activeTab]}
          onPress={() => {
            setActiveTab('add');
            resetForm();
          }}
        >
          <Text style={styles.tabText}>Add Video</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' && (
        <View style={styles.tabContent}>
          <AdminTextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {filteredVideos.length === 0 ? (
            <Text style={styles.emptyText}>No training videos found.</Text>
          ) : (
            <FlatList
              data={filteredVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              refreshing={loading}
              onRefresh={fetchVideos}
            />
          )}
        </View>
      )}

      {(activeTab === 'add' || activeTab === 'update') && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Training Video' : 'Add New Training Video'}</Text>
          
          <AdminTextInput
            style={styles.input}
            placeholder="Title *"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
          <AdminTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
          <View style={styles.uploadSection}>
            <AdminTextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Video URL *"
              value={formData.videoUrl}
              onChangeText={(text) => setFormData({ ...formData, videoUrl: text })}
            />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                const result = await pickAndUploadVideo('furmaa/videos');
                if (result) {
                  setFormData({ ...formData, videoUrl: result.url });
                  Alert.alert('Success', 'Video uploaded successfully!');
                }
              }}
            >
              <Text style={styles.uploadButtonText}>📹 Upload</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.uploadSection}>
            <AdminTextInput
              style={[styles.input, { flex: 1, marginRight: 10 }]}
              placeholder="Thumbnail URL (Optional)"
              value={formData.thumbnail}
              onChangeText={(text) => setFormData({ ...formData, thumbnail: text })}
            />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={async () => {
                const result = await pickAndUploadImage('furmaa/thumbnails');
                if (result) {
                  setFormData({ ...formData, thumbnail: result.url });
                  Alert.alert('Success', 'Thumbnail uploaded successfully!');
                }
              }}
            >
              <Text style={styles.uploadButtonText}>🖼️ Upload</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Category *</Text>
              <Text style={styles.helperText}>
                {formData.category === 'basic' && '✅ Free videos - All users can access'}
                {formData.category === 'intermediate' && '🔒 Premium - Subscription required'}
                {formData.category === 'advanced' && '🔒 Premium - Subscription required'}
                {!formData.category && 'Select category to continue'}
              </Text>
              <View style={styles.categoryButtons}>
                {['basic', 'intermediate', 'advanced'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton, 
                      formData.category === cat && styles.categoryButtonActive,
                      cat === 'basic' && styles.categoryButtonBasic,
                      cat === 'intermediate' && styles.categoryButtonIntermediate,
                      cat === 'advanced' && styles.categoryButtonAdvanced,
                    ]}
                    onPress={() => {
                      const isFree = cat === 'basic';
                      setFormData({ 
                        ...formData, 
                        category: cat,
                        isFree: isFree,
                        isPremium: !isFree,
                      });
                    }}
                  >
                    <Text style={[styles.categoryButtonText, formData.category === cat && styles.categoryButtonTextActive]}>
                      {cat === 'basic' && '🆓 '}
                      {cat === 'intermediate' && '⭐ '}
                      {cat === 'advanced' && '👑 '}
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Level</Text>
              <View style={styles.categoryButtons}>
                {['beginner', 'intermediate', 'advanced'].map((lev) => (
                  <TouchableOpacity
                    key={lev}
                    style={[styles.categoryButton, formData.level === lev && styles.categoryButtonActive]}
                    onPress={() => setFormData({ ...formData, level: lev })}
                  >
                    <Text style={[styles.categoryButtonText, formData.level === lev && styles.categoryButtonTextActive]}>
                      {lev.charAt(0).toUpperCase() + lev.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Pet Type</Text>
          <View style={styles.categoryButtons}>
            {['dog', 'cat', 'both'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.categoryButton,
                  formData.petType.includes(type) && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  const newPetTypes = formData.petType.includes(type)
                    ? formData.petType.filter((t) => t !== type)
                    : [...formData.petType, type];
                  setFormData({ ...formData, petType: newPetTypes.length > 0 ? newPetTypes : ['both'] });
                }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    formData.petType.includes(type) && styles.categoryButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AdminTextInput
            style={styles.input}
            placeholder="Duration (minutes) *"
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            keyboardType="numeric"
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Order (display order)"
            value={formData.order}
            onChangeText={(text) => setFormData({ ...formData, order: text })}
            keyboardType="numeric"
          />

          <Text style={styles.sectionLabel}>Instructor Details (Optional)</Text>
          <AdminTextInput
            style={styles.input}
            placeholder="Instructor Name"
            value={formData.instructorName}
            onChangeText={(text) => setFormData({ ...formData, instructorName: text })}
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Instructor Title"
            value={formData.instructorTitle}
            onChangeText={(text) => setFormData({ ...formData, instructorTitle: text })}
          />
          <AdminTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Instructor Bio"
            value={formData.instructorBio}
            onChangeText={(text) => setFormData({ ...formData, instructorBio: text })}
            multiline
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Instructor Experience (years)"
            value={formData.instructorExperience}
            onChangeText={(text) => setFormData({ ...formData, instructorExperience: text })}
            keyboardType="numeric"
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Instructor Image URL"
            value={formData.instructorImage}
            onChangeText={(text) => setFormData({ ...formData, instructorImage: text })}
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Instructor Specialization"
            value={formData.instructorSpecialization}
            onChangeText={(text) => setFormData({ ...formData, instructorSpecialization: text })}
          />

          <Text style={styles.sectionLabel}>Course Details (Optional)</Text>
          <AdminTextInput
            style={styles.input}
            placeholder="Course Duration (e.g., 7 Days)"
            value={formData.courseDuration}
            onChangeText={(text) => setFormData({ ...formData, courseDuration: text })}
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Lessons Count"
            value={formData.lessonsCount}
            onChangeText={(text) => setFormData({ ...formData, lessonsCount: text })}
            keyboardType="numeric"
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Quizzes Count"
            value={formData.quizzesCount}
            onChangeText={(text) => setFormData({ ...formData, quizzesCount: text })}
            keyboardType="numeric"
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Difficulty (Easy/Medium/Hard)"
            value={formData.difficulty}
            onChangeText={(text) => setFormData({ ...formData, difficulty: text })}
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {formData.category === 'basic' && '✅ This is a FREE video. All users can access it.'}
              {formData.category === 'intermediate' && '🔒 This is a PREMIUM video. Subscription required.'}
              {formData.category === 'advanced' && '🔒 This is a PREMIUM video. Subscription required.'}
              {!formData.category && '⚠️ Please select a category first'}
            </Text>
          </View>
          
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, formData.category === 'basic' && styles.checkboxDisabled]}
              onPress={() => {
                if (formData.category !== 'basic') {
                  setFormData({ ...formData, isFree: !formData.isFree, isPremium: formData.isFree });
                }
              }}
              disabled={formData.category === 'basic'}
            >
              {formData.isFree && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={[styles.checkboxLabel, formData.category === 'basic' && styles.checkboxLabelDisabled]}>
              Free Video {formData.category === 'basic' && '(Auto-set for Basic)'}
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, formData.category === 'basic' && styles.checkboxDisabled]}
              onPress={() => {
                if (formData.category !== 'basic') {
                  setFormData({ ...formData, isPremium: !formData.isPremium, isFree: formData.isPremium });
                }
              }}
              disabled={formData.category === 'basic'}
            >
              {formData.isPremium && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={[styles.checkboxLabel, formData.category === 'basic' && styles.checkboxLabelDisabled]}>
              Premium Video {formData.category !== 'basic' && '(Auto-set for Intermediate/Advanced)'}
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
            >
              {formData.isActive && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Active</Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={editingId ? handleUpdateVideo : handleAddVideo}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{editingId ? 'Update Video' : 'Add Video'}</Text>
            )}
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => setActiveTab('list')}>
              <Text style={styles.cancelButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#111827',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#6B7280',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  videoInfo: {
    marginBottom: 12,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    flex: 1,
  },
  videoCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  videoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  videoMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  instructorName: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  videoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  categoryButtonBasic: {
    borderColor: '#10B981',
  },
  categoryButtonIntermediate: {
    borderColor: '#F59E0B',
  },
  categoryButtonAdvanced: {
    borderColor: '#8B5CF6',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  checkboxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  checkboxLabelDisabled: {
    opacity: 0.5,
    color: '#9CA3AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  checkboxDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  checkboxLabelDisabled: {
    opacity: 0.5,
    color: '#9CA3AF',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AdminTrainingVideosScreen;




