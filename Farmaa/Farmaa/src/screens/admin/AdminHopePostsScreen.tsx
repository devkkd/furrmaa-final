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

interface HopePost {
  _id: string;
  postType: 'adoption' | 'lostFound';
  petType: 'dog' | 'cat';
  petName: string;
  petAgeText?: string;
  locationText: string;
  description?: string;
  images?: string[];
  status: 'active' | 'closed';
  reportsCount?: number;
  user?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

const AdminHopePostsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'edit' | 'delete'>('list');
  const [posts, setPosts] = useState<HopePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPostType, setFilterPostType] = useState<'all' | 'lostFound' | 'adoption'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');

  const [formData, setFormData] = useState({
    locationText: '',
    description: '',
    status: 'active' as 'active' | 'closed',
    postType: 'lostFound' as 'adoption' | 'lostFound',
    petType: 'dog' as 'dog' | 'cat',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'edit' || activeTab === 'delete') {
      fetchPosts();
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (filterPostType !== 'all') params.postType = filterPostType;
      if (filterStatus !== 'all') params.status = filterStatus;
      const qs = new URLSearchParams(params).toString();
      const url = `${api.ENDPOINTS.ADMIN.HOPE_POSTS}${qs ? `?${qs}` : ''}`;
      const response = await api.CLIENT.get(url);
      setPosts(response.data.posts || []);
    } catch (err: any) {
      console.error('Failed to fetch Hope posts:', err);
      setError(err.response?.data?.message || 'Failed to load Hope posts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      locationText: '',
      description: '',
      status: 'active',
      postType: 'lostFound',
      petType: 'dog',
    });
    setEditingId(null);
  };

  const handleEdit = (post: HopePost) => {
    setEditingId(post._id);
    setFormData({
      locationText: post.locationText || '',
      description: post.description || '',
      status: post.status || 'active',
      postType: post.postType || 'lostFound',
      petType: post.petType || 'dog',
    });
    setActiveTab('edit');
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      setLoading(true);
      const payload = {
        locationText: formData.locationText.trim(),
        description: formData.description.trim(),
        status: formData.status,
        postType: formData.postType,
        petType: formData.petType,
      };
      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.HOPE_POSTS}/${editingId}`, payload);
      Alert.alert('Success', 'Hope post updated successfully');
      resetForm();
      setActiveTab('list');
      fetchPosts();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (postId: string, postName: string, newStatus: 'active' | 'closed') => {
    Alert.alert(
      'Update Status',
      `Set "${postName}" to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setLoading(true);
              const url = api.ENDPOINTS.ADMIN.HOPE_POST_STATUS.replace(':id', postId);
              await api.CLIENT.put(url, { status: newStatus });
              Alert.alert('Success', `Status updated to ${newStatus}`);
              fetchPosts();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (postId: string, postName: string) => {
    Alert.alert(
      'Delete Hope Post',
      `Are you sure you want to delete "${postName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.HOPE_POSTS}/${postId}`);
              Alert.alert('Success', 'Hope post deleted successfully');
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
    post.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.locationText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>Edit Hope Post</Text>

      <Text style={styles.label}>Post Type</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={[styles.radioOption, formData.postType === 'lostFound' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, postType: 'lostFound' })}
        >
          <Text style={formData.postType === 'lostFound' ? styles.radioTextSelected : styles.radioText}>
            Lost & Found
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, formData.postType === 'adoption' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, postType: 'adoption' })}
        >
          <Text style={formData.postType === 'adoption' ? styles.radioTextSelected : styles.radioText}>
            Adoption
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Pet Type</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={[styles.radioOption, formData.petType === 'dog' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, petType: 'dog' })}
        >
          <Text style={formData.petType === 'dog' ? styles.radioTextSelected : styles.radioText}>Dog</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, formData.petType === 'cat' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, petType: 'cat' })}
        >
          <Text style={formData.petType === 'cat' ? styles.radioTextSelected : styles.radioText}>Cat</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Location *</Text>
      <AdminTextInput
        style={styles.input}
        placeholder="Location (e.g. Pratap Nagar, Jaipur)"
        value={formData.locationText}
        onChangeText={(text) => setFormData({ ...formData, locationText: text })}
      />

      <Text style={styles.label}>Description</Text>
      <AdminTextInput
        style={styles.textArea}
        placeholder="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Status</Text>
      <View style={styles.radioRow}>
        <TouchableOpacity
          style={[styles.radioOption, formData.status === 'active' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, status: 'active' })}
        >
          <Text style={formData.status === 'active' ? styles.radioTextSelected : styles.radioText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.radioOption, formData.status === 'closed' && styles.radioSelected]}
          onPress={() => setFormData({ ...formData, status: 'closed' })}
        >
          <Text style={formData.status === 'closed' ? styles.radioTextSelected : styles.radioText}>Closed</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.submitButtonText}>Update Post</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setActiveTab('list'); }}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPostItem = ({ item }: { item: HopePost }) => {
    const imageUri = item.images?.[0];
    const emoji = item.petType === 'dog' ? '🐕' : '🐱';
    const typeLabel = item.postType === 'lostFound' ? 'Lost & Found' : 'Adoption';

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <View style={styles.thumbnail}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.thumbnailImage} />
              ) : (
                <Text style={styles.thumbnailEmoji}>{emoji}</Text>
              )}
            </View>
            <View style={styles.postInfo}>
              <Text style={styles.petName}>{item.petName}</Text>
              <Text style={styles.typeBadge}>{typeLabel}</Text>
              <Text style={styles.locationText} numberOfLines={1}>{item.locationText}</Text>
              <Text style={styles.userText}>{item.user?.name || 'Unknown'}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, item.status === 'active' ? styles.statusActive : styles.statusClosed]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
                {item.reportsCount && item.reportsCount > 0 && (
                  <Text style={styles.reportsText}>⚠️ {item.reportsCount} reports</Text>
                )}
              </View>
            </View>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>
        ) : null}
        <View style={styles.actionsRow}>
          {activeTab === 'edit' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
          {(activeTab === 'list' || activeTab === 'edit') && (
            <>
              {activeTab === 'list' && (
                <TouchableOpacity
                  style={[styles.actionBtn, item.status === 'active' ? styles.actionBtnSecondary : styles.actionBtnPrimary]}
                  onPress={() => handleStatusChange(item._id, item.petName, item.status === 'active' ? 'closed' : 'active')}
                >
                  <Text style={styles.actionBtnText}>
                    {item.status === 'active' ? 'Close' : 'Reopen'}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
          {activeTab === 'delete' && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.petName)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Hope Posts</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.tabsContainer}>
        {['list', 'edit', 'delete'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab as any);
              if (tab !== 'edit') resetForm();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'list' ? 'List' : tab === 'edit' ? 'Edit' : 'Delete'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'edit' && editingId ? (
        renderForm()
      ) : (
        <View style={styles.listContainer}>
          {/* Filters */}
          <View style={styles.filtersRow}>
            <AdminTextInput
              style={styles.searchInput}
              placeholder="Search pet, location, user..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
              {(['all', 'lostFound', 'adoption'] as const).map((pt) => (
                <TouchableOpacity
                  key={pt}
                  style={[styles.chip, filterPostType === pt && styles.chipActive]}
                  onPress={() => { setFilterPostType(pt); fetchPosts(); }}
                >
                  <Text style={[styles.chipText, filterPostType === pt && styles.chipTextActive]}>
                    {pt === 'all' ? 'All Types' : pt === 'lostFound' ? 'Lost & Found' : 'Adoption'}
                  </Text>
                </TouchableOpacity>
              ))}
              {(['all', 'active', 'closed'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.chip, filterStatus === st && styles.chipActive]}
                  onPress={() => { setFilterStatus(st); fetchPosts(); }}
                >
                  <Text style={[styles.chipText, filterStatus === st && styles.chipTextActive]}>
                    {st === 'all' ? 'All Status' : st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading && posts.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Loading Hope posts...</Text>
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
                {searchQuery ? 'No posts match your search' : 'No Hope posts yet'}
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
  filtersRow: {
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
    marginBottom: 10,
  },
  filterChips: {
    marginHorizontal: -15,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1E3A8A',
  },
  chipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFFFFF',
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
  },
  postHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    marginRight: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailEmoji: {
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 60,
  },
  postInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  typeBadge: {
    fontSize: 11,
    color: '#1E3A8A',
    fontWeight: '600',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  userText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportsText: {
    fontSize: 11,
    color: '#DC2626',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 10,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  actionBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#059669',
  },
  actionBtnSecondary: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtnText: {
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  radioOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  radioSelected: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  radioText: {
    fontSize: 14,
    color: '#6B7280',
  },
  radioTextSelected: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
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
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
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

export default AdminHopePostsScreen;
