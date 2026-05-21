import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface Post {
  _id: string;
  content: string;
  images?: string[];
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  pet?: {
    _id: string;
    name: string;
    type: string;
  };
  likes: any[];
  comments: any[];
  createdAt: string;
}

const AdminPostsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'update' | 'delete'>('list');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for add/update
  const [formData, setFormData] = useState({
    content: '',
    images: '',
    userId: '',
    petId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'update' || activeTab === 'delete') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.POSTS);
      setPosts(response.data.posts || []);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      images: '',
      userId: '',
      petId: '',
    });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Content is required');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        content: formData.content.trim(),
        user: formData.userId.trim() || undefined,
        pet: formData.petId.trim() || undefined,
      };

      if (formData.images.trim()) {
        payload.images = formData.images.split(',').map(url => url.trim()).filter(Boolean);
      }

      await api.CLIENT.post(api.ENDPOINTS.ADMIN.POSTS, payload);
      Alert.alert('Success', 'Post created successfully');
      resetForm();
      setActiveTab('list');
      fetchPosts();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingId(post._id);
    setFormData({
      content: post.content || '',
      images: post.images?.join(', ') || '',
      userId: post.user?._id || '',
      petId: post.pet?._id || '',
    });
    setActiveTab('update');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Content is required');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        content: formData.content.trim(),
        pet: formData.petId.trim() || undefined,
      };

      if (formData.images.trim()) {
        payload.images = formData.images.split(',').map(url => url.trim()).filter(Boolean);
      }

      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.POSTS}/${editingId}`, payload);
      Alert.alert('Success', 'Post updated successfully');
      resetForm();
      setActiveTab('list');
      fetchPosts();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.POSTS}/${postId}`);
              Alert.alert('Success', 'Post deleted successfully');
              fetchPosts();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete post');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>
        {editingId ? 'Update Post' : 'Create New Post'}
      </Text>

      <AdminTextInput
        style={styles.textArea}
        placeholder="Post Content *"
        value={formData.content}
        onChangeText={(text) => setFormData({ ...formData, content: text })}
        multiline
        numberOfLines={8}
      />
      <AdminTextInput
        style={styles.input}
        placeholder="Image URLs (comma-separated)"
        value={formData.images}
        onChangeText={(text) => setFormData({ ...formData, images: text })}
      />
      <AdminTextInput
        style={styles.input}
        placeholder="User ID (optional)"
        value={formData.userId}
        onChangeText={(text) => setFormData({ ...formData, userId: text })}
        editable={!editingId}
      />
      <AdminTextInput
        style={styles.input}
        placeholder="Pet ID (optional)"
        value={formData.petId}
        onChangeText={(text) => setFormData({ ...formData, petId: text })}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={editingId ? handleUpdate : handleAdd}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            {editingId ? 'Update Post' : 'Create Post'}
          </Text>
        )}
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setActiveTab('list'); }}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user?.profileImage || '👤'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{item.user?.name || 'User'}</Text>
            {item.pet && <Text style={styles.petName}>{item.pet.name}</Text>}
          </View>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.postImage} />
          {item.images.length > 1 && (
            <Text style={styles.moreImagesText}>+{item.images.length - 1} more</Text>
          )}
        </View>
      )}
      <View style={styles.postStats}>
        <Text style={styles.statText}>❤️ {item.likes?.length || 0}</Text>
        <Text style={styles.statText}>💬 {item.comments?.length || 0}</Text>
      </View>
      {activeTab === 'update' && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      )}
      {activeTab === 'delete' && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Feed Posts</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['list', 'add', 'update', 'delete'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab as any);
              if (tab !== 'add') resetForm();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'add' || activeTab === 'update' ? (
        renderForm()
      ) : (
        <View style={styles.listContainer}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <AdminTextInput
              style={styles.searchInput}
              placeholder="Search posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* List */}
          {loading && posts.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No posts found' : 'No posts yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              keyExtractor={(item) => item._id}
              renderItem={renderPostItem}
              contentContainerStyle={styles.list}
              refreshing={loading}
              onRefresh={fetchPosts}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 24,
    color: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1E3A8A',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  list: {
    padding: 15,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  petName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  moreImagesText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  editButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AdminPostsScreen;








