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
  Modal,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';
import { VET_SERVICE_TYPES } from '../../constants/vetServiceTypes';
import { pickAndUploadImage } from '../../utils/imageUpload';
import { forwardGeocode } from '../../utils/geolocation';

interface Veterinarian {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  specialization?: string;
  qualification?: string;
  clinicName?: string;
  experience?: number;
  licenseNumber?: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  isActive: boolean;
  serviceType?: string;
}

const AdminVeterinariansScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'update' | 'delete'>('list');
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form: sirf name, location, number, photo, type (design ke hisaab se)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    profileImage: '',
    serviceType: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeList, setTypeList] = useState<{ name: string; slug: string }[]>([]);
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (activeTab === 'list' || activeTab === 'update' || activeTab === 'delete') {
      fetchVeterinarians();
    }
  }, [activeTab]);

  // Type dropdown: hamesha saari 8 standard types dikhao (API pe depend mat karo)
  useEffect(() => {
    const standardTypes = (VET_SERVICE_TYPES as readonly string[])
      .filter((x) => x !== 'All')
      .map((name) => ({ name, slug: name }));
    setTypeList(standardTypes);
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.CLIENT.get(api.ENDPOINTS.ADMIN.VETERINARIANS);
      setVeterinarians(response.data.veterinarians || []);
    } catch (err: any) {
      console.error('Failed to fetch veterinarians:', err);
      setError(err.response?.data?.message || 'Failed to load veterinarians');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      location: '',
      profileImage: '',
      serviceType: '',
    });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setLoading(true);
      const loc = formData.location.trim();
      let address: { street: string; city: string; latitude?: number; longitude?: number } | undefined;
      if (loc) {
        address = { street: loc, city: loc };
        try {
          const coords = await forwardGeocode(loc);
          if (coords) {
            address.latitude = coords.lat;
            address.longitude = coords.lng;
          }
        } catch (_) {}
      }
      const payload = {
        name: formData.name.trim(),
        email: `vet_${formData.phone?.trim() || Date.now()}@farmaa.local`,
        phone: formData.phone.trim() || undefined,
        address,
        profileImage: formData.profileImage || undefined,
        serviceType: formData.serviceType.trim() || undefined,
      };

      await api.CLIENT.post(api.ENDPOINTS.ADMIN.VETERINARIANS, payload);
      Alert.alert('Success', 'Veterinarian added successfully');
      resetForm();
      setActiveTab('list');
      fetchVeterinarians();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add veterinarian');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vet: Veterinarian) => {
    setEditingId(vet._id);
    const loc = vet.address
      ? [vet.address.street, vet.address.city, vet.address.state].filter(Boolean).join(', ')
      : '';
    setFormData({
      name: vet.name || '',
      phone: vet.phone || '',
      location: loc,
      profileImage: vet.profileImage || '',
      serviceType: vet.serviceType || '',
    });
    setActiveTab('update');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setLoading(true);
      const loc = formData.location.trim();
      let address: { street: string; city: string; latitude?: number; longitude?: number } | undefined;
      if (loc) {
        address = { street: loc, city: loc };
        try {
          const coords = await forwardGeocode(loc);
          if (coords) {
            address.latitude = coords.lat;
            address.longitude = coords.lng;
          }
        } catch (_) {}
      }
      const payload: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        address,
        profileImage: formData.profileImage || undefined,
        serviceType: formData.serviceType.trim() || undefined,
      };

      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.VETERINARIANS}/${editingId}`, payload);
      Alert.alert('Success', 'Veterinarian updated successfully');
      resetForm();
      setActiveTab('list');
      fetchVeterinarians();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update veterinarian');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (vetId: string, vetName: string) => {
    Alert.alert(
      'Delete Veterinarian',
      `Are you sure you want to deactivate "${vetName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.VETERINARIANS}/${vetId}`);
              Alert.alert('Success', 'Veterinarian deactivated successfully');
              fetchVeterinarians();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete veterinarian');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredVeterinarians = veterinarians.filter((vet) =>
    vet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vet.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vet.clinicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vet.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickPhoto = async () => {
    const result = await pickAndUploadImage('furmaa/vets');
    if (result?.url) setFormData({ ...formData, profileImage: result.url });
  };

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScrollContent}>
      <Text style={styles.formTitle}>
        {editingId ? 'Update Veterinarian' : 'Add New Veterinarian'}
      </Text>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>Name *</Text>
        <AdminTextInput
          style={styles.input}
          placeholder="e.g. Dr. Rahul Sharma"
          value={formData.name}
          onChangeText={(t) => setFormData({ ...formData, name: t })}
        />
        <Text style={styles.fieldLabel}>Phone (Number)</Text>
        <AdminTextInput
          style={styles.input}
          placeholder="e.g. 9876543210"
          value={formData.phone}
          onChangeText={(t) => setFormData({ ...formData, phone: t })}
          keyboardType="phone-pad"
        />
        <Text style={styles.fieldLabel}>Location</Text>
        <AdminTextInput
          style={styles.input}
          placeholder="e.g. MG Road, Mumbai"
          value={formData.location}
          onChangeText={(t) => setFormData({ ...formData, location: t })}
        />
        <Text style={styles.fieldLabel}>Photo</Text>
        <TouchableOpacity style={styles.photoBox} onPress={handlePickPhoto}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoPlaceholder}>+ Add Photo</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.fieldLabel}>Type</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowTypePicker(true)}>
          <Text style={formData.serviceType ? styles.typeSelectedText : styles.typePlaceholderText}>
            {formData.serviceType || 'Select type'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showTypePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTypePicker(false)}>
          <View style={styles.typePickerModal}>
            <Text style={styles.typePickerTitle}>Select Type</Text>
            <ScrollView style={styles.typePickerList} nestedScrollEnabled>
              {typeList.map((t) => (
                <TouchableOpacity
                  key={t.slug}
                  style={styles.typePickerItem}
                  onPress={() => {
                    setFormData({ ...formData, serviceType: t.name });
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={styles.typePickerItemText}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.typePickerCancel} onPress={() => setShowTypePicker(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={editingId ? handleUpdate : handleAdd}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>
            {editingId ? 'Update Veterinarian' : 'Add Veterinarian'}
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

  const renderVeterinarianItem = ({ item }: { item: Veterinarian }) => (
    <View style={styles.vetCard}>
      <View style={styles.vetInfo}>
        <Text style={styles.vetName}>{item.name}</Text>
        {item.clinicName ? <Text style={styles.vetClinic}>{item.clinicName}</Text> : null}
        <Text style={styles.vetEmail}>{item.email}</Text>
        {item.phone ? <Text style={styles.vetPhone}>{item.phone}</Text> : null}
        {item.specialization ? <Text style={styles.vetSpecialization}>{item.specialization}</Text> : null}
        {item.address && [item.address.street, item.address.city, item.address.state].some(Boolean) ? (
          <Text style={styles.vetAddress}>
            {[item.address.street, item.address.city, item.address.state]
              .filter(Boolean)
              .join(', ')}
          </Text>
        ) : null}
        <View style={styles.vetBadges}>
          {item.serviceType ? <Text style={styles.badge}>{item.serviceType}</Text> : null}
          {(item.rating ?? 0) > 0 ? (
            <Text style={styles.badge}>⭐ {Number(item.rating).toFixed(1)}</Text>
          ) : null}
          {(item.experience ?? 0) > 0 ? <Text style={styles.badge}>{item.experience} yrs exp</Text> : null}
          {!item.isActive ? <Text style={[styles.badge, styles.inactiveBadge]}>Inactive</Text> : null}
        </View>
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
          onPress={() => handleDelete(item._id, item.name)}
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
        <Text style={styles.headerTitle}>Manage Veterinarians</Text>
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
              placeholder="Search veterinarians..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* List */}
          {loading && veterinarians.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Loading veterinarians...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchVeterinarians}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredVeterinarians.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No veterinarians found' : 'No veterinarians yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredVeterinarians}
              keyExtractor={(item) => item._id}
              renderItem={renderVeterinarianItem}
              contentContainerStyle={styles.list}
              refreshing={loading}
              onRefresh={fetchVeterinarians}
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
  vetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vetInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  vetClinic: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  vetEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  vetPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  vetSpecialization: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  vetAddress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  vetBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    fontSize: 11,
    color: '#1E3A8A',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inactiveBadge: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  editButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
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
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
  },
  formScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
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
  typeSelectedText: {
    fontSize: 14,
    color: '#1F2937',
  },
  typePlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  typePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  typePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  typePickerList: {
    maxHeight: 320,
  },
  typePickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typePickerItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  typePickerCancel: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  photoBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
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

export default AdminVeterinariansScreen;








