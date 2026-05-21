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
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { pickAndUploadImage } from '../../utils/imageUpload';
import AdminTextInput from './AdminTextInput';

interface PetEvent {
  _id: string;
  title: string;
  dateText: string;
  venue: string;
  city: string;
  posterUrl?: string;
  images?: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const AdminPetEventsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit' | 'delete'>('list');
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState({
    title: '',
    dateText: '',
    venue: '',
    city: '',
    posterUrl: '',
    image2Url: '',
    description: '',
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [registrationsEvent, setRegistrationsEvent] = useState<PetEvent | null>(null);
  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<'photo1' | 'photo2' | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const openRegistrations = async (ev: PetEvent) => {
    setRegistrationsEvent(ev);
    setRegistrationsList([]);
    setLoadingRegistrations(true);
    try {
      const res = await api.CLIENT.get(`${api.ENDPOINTS.ADMIN.PET_EVENTS}/${ev._id}/registrations`);
      setRegistrationsList(res.data?.registrations || []);
    } catch {
      setRegistrationsList([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = {};
      if (filterCity.trim()) params.city = filterCity.trim();
      if (filterActive === 'active') params.isActive = 'true';
      if (filterActive === 'inactive') params.isActive = 'false';
      const qs = new URLSearchParams(params).toString();
      const url = `${api.ENDPOINTS.ADMIN.PET_EVENTS}${qs ? `?${qs}` : ''}`;
      const response = await api.CLIENT.get(url);
      setEvents(response.data.events || []);
    } catch (err: any) {
      console.error('Failed to fetch pet events:', err);
      setError(err.response?.data?.message || 'Failed to load pet events');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      dateText: '',
      venue: '',
      city: '',
      posterUrl: '',
      image2Url: '',
      description: '',
      isActive: true,
    });
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.dateText.trim() || !formData.venue.trim() || !formData.city.trim()) {
      Alert.alert('Error', 'Title, Date, Venue and City are required');
      return;
    }

    try {
      setLoading(true);
      const images = [formData.posterUrl.trim(), formData.image2Url.trim()].filter(Boolean);
      const payload = {
        title: formData.title.trim(),
        dateText: formData.dateText.trim(),
        venue: formData.venue.trim(),
        city: formData.city.trim(),
        posterUrl: images[0] || undefined,
        images: images.length ? images : undefined,
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      };
      await api.CLIENT.post(api.ENDPOINTS.ADMIN.PET_EVENTS, payload);
      Alert.alert('Success', 'Pet event created successfully');
      resetForm();
      setActiveTab('list');
      fetchEvents();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ev: PetEvent) => {
    setEditingId(ev._id);
    setFormData({
      title: ev.title || '',
      dateText: ev.dateText || '',
      venue: ev.venue || '',
      city: ev.city || '',
      posterUrl: ev.posterUrl || ev.images?.[0] || '',
      image2Url: ev.images?.[1] || '',
      description: ev.description || '',
      isActive: ev.isActive ?? true,
    });
    setActiveTab('edit');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!formData.title.trim() || !formData.dateText.trim() || !formData.venue.trim() || !formData.city.trim()) {
      Alert.alert('Error', 'Title, Date, Venue and City are required');
      return;
    }

    try {
      setLoading(true);
      const images = [formData.posterUrl.trim(), formData.image2Url.trim()].filter(Boolean);
      const payload = {
        title: formData.title.trim(),
        dateText: formData.dateText.trim(),
        venue: formData.venue.trim(),
        city: formData.city.trim(),
        posterUrl: images[0] || undefined,
        images: images.length ? images : undefined,
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      };
      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.PET_EVENTS}/${editingId}`, payload);
      Alert.alert('Success', 'Pet event updated successfully');
      resetForm();
      setActiveTab('list');
      fetchEvents();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Delete Pet Event',
      `Are you sure you want to delete "${eventTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.PET_EVENTS}/${eventId}`);
              Alert.alert('Success', 'Pet event deleted successfully');
              fetchEvents();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete event');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredEvents = events.filter(
    (ev) =>
      ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>{editingId ? 'Edit Pet Event' : 'Add New Pet Event'}</Text>

      <Text style={styles.inputLabel}>Event Title – yahaan event ka naam likhen</Text>
      <AdminTextInput
        style={styles.input}
        placeholder="e.g. Jaipur Dog Show 2025"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <Text style={styles.inputLabel}>Date – event ki date (jaise Sunday 15 February 2025)</Text>
      <AdminTextInput
        style={styles.input}
        placeholder="e.g. Sunday 15 February 2025"
        value={formData.dateText}
        onChangeText={(text) => setFormData({ ...formData, dateText: text })}
      />

      <Text style={styles.inputLabel}>Venue – event ki jagah / address</Text>
      <AdminTextInput
        style={styles.input}
        placeholder="e.g. Bharat Sanskar, Jaipur"
        value={formData.venue}
        onChangeText={(text) => setFormData({ ...formData, venue: text })}
      />

      <Text style={styles.inputLabel}>City – sheher ka naam</Text>
      <AdminTextInput
        style={styles.input}
        placeholder="e.g. Jaipur"
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
      />

      <Text style={styles.inputLabel}>Photo 1 (Poster) – main event image / poster</Text>
      <TouchableOpacity
        style={styles.uploadPhotoBtn}
        onPress={async () => {
          setUploadingPhoto('photo1');
          const result = await pickAndUploadImage('furmaa/pet-events');
          if (result && result.url) {
            setFormData({ ...formData, posterUrl: result.url });
            Alert.alert('Done', 'Photo 1 uploaded. You can also paste a URL below.');
          }
          setUploadingPhoto(null);
        }}
        disabled={!!uploadingPhoto}
      >
        {uploadingPhoto === 'photo1' ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.uploadPhotoBtnText}>📷 Upload Photo 1 (Poster)</Text>
        )}
      </TouchableOpacity>
      {formData.posterUrl ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: formData.posterUrl }} style={styles.photoPreviewImg} />
        </View>
      ) : null}
      <AdminTextInput
        style={styles.input}
        placeholder="Or paste Photo 1 URL here"
        value={formData.posterUrl}
        onChangeText={(text) => setFormData({ ...formData, posterUrl: text })}
        keyboardType="url"
      />

      <Text style={styles.inputLabel}>Photo 2 (Optional) – doosri photo agar chahiye</Text>
      <TouchableOpacity
        style={[styles.uploadPhotoBtn, styles.uploadPhotoBtnSecondary]}
        onPress={async () => {
          setUploadingPhoto('photo2');
          const result = await pickAndUploadImage('furmaa/pet-events');
          if (result && result.url) {
            setFormData({ ...formData, image2Url: result.url });
            Alert.alert('Done', 'Photo 2 uploaded. You can also paste a URL below.');
          }
          setUploadingPhoto(null);
        }}
        disabled={!!uploadingPhoto}
      >
        {uploadingPhoto === 'photo2' ? (
          <ActivityIndicator size="small" color="#1E3A8A" />
        ) : (
          <Text style={styles.uploadPhotoBtnTextSecondary}>📷 Upload Photo 2</Text>
        )}
      </TouchableOpacity>
      {formData.image2Url ? (
        <View style={styles.photoPreview}>
          <Image source={{ uri: formData.image2Url }} style={styles.photoPreviewImg} />
        </View>
      ) : null}
      <AdminTextInput
        style={styles.input}
        placeholder="Or paste Photo 2 URL here"
        value={formData.image2Url}
        onChangeText={(text) => setFormData({ ...formData, image2Url: text })}
        keyboardType="url"
      />
      <Text style={styles.inputLabel}>Description – event ki detail / about (optional)</Text>
      <AdminTextInput
        style={styles.textArea}
        placeholder="Event ki description yahaan likhen..."
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.inputLabel}>Status – event dikhega app/web pe ya nahi</Text>
      <View style={styles.checkRow}>
        <TouchableOpacity
          style={[styles.checkOption, formData.isActive && styles.checkSelected]}
          onPress={() => setFormData({ ...formData, isActive: true })}
        >
          <Text style={[styles.checkText, formData.isActive && styles.checkTextSelected]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkOption, !formData.isActive && styles.checkSelected]}
          onPress={() => setFormData({ ...formData, isActive: false })}
        >
          <Text style={[styles.checkText, !formData.isActive && styles.checkTextSelected]}>Inactive</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={editingId ? handleUpdate : handleAdd}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>{editingId ? 'Update Event' : 'Add Event'}</Text>
      </TouchableOpacity>
      {editingId && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setActiveTab('list'); }}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderEventItem = ({ item }: { item: PetEvent }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventThumb}>
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={styles.thumbImage} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbEmoji}>🐶🎉</Text>
          </View>
        )}
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventMeta}>{item.dateText}</Text>
        <Text style={styles.eventMeta}>📍 {item.venue}, {item.city}</Text>
        <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
        {(activeTab === 'list' || activeTab === 'edit') && (
          <>
            <TouchableOpacity style={styles.regBtn} onPress={() => openRegistrations(item)}>
              <Text style={styles.regBtnText}>Registrations</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
          </>
        )}
        {activeTab === 'delete' && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.title)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Pet Events</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.tabsContainer}>
        {['list', 'add', 'edit', 'delete'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab as any);
              if (tab !== 'add' && tab !== 'edit') resetForm();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'add' || (activeTab === 'edit' && editingId) ? (
        renderForm()
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.filtersRow}>
            <AdminTextInput
              style={styles.searchInput}
              placeholder="Search title, venue, city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <AdminTextInput
              style={styles.cityInput}
              placeholder="Filter by city"
              value={filterCity}
              onChangeText={setFilterCity}
            />
            <View style={styles.filterChipsRow}>
              {(['all', 'active', 'inactive'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, filterActive === f && styles.chipActive]}
                  onPress={() => { setFilterActive(f); fetchEvents(); }}
                >
                  <Text style={[styles.chipText, filterActive === f && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchEvents}>
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading && events.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>Loading pet events...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No events match your search' : 'No pet events yet'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item._id}
              renderItem={renderEventItem}
              contentContainerStyle={styles.list}
              refreshing={loading}
              onRefresh={fetchEvents}
            />
          )}
        </View>
      )}

      {activeTab === 'edit' && !editingId && (
        <View style={styles.centerContainer}>
          <Text style={styles.hintText}>Select an event from the list to edit</Text>
        </View>
      )}

      <Modal visible={!!registrationsEvent} transparent animationType="fade">
        <TouchableOpacity style={styles.regModalOverlay} activeOpacity={1} onPress={() => setRegistrationsEvent(null)}>
          <View style={styles.regModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.regModalTitle}>
              Registrations{registrationsEvent ? ` – ${registrationsEvent.title}` : ''}
            </Text>
            {loadingRegistrations ? (
              <ActivityIndicator size="large" color="#1E3A8A" style={{ marginVertical: 24 }} />
            ) : registrationsList.length === 0 ? (
              <Text style={styles.regEmpty}>No registrations yet.</Text>
            ) : (
              <ScrollView style={styles.regScroll}>
                {registrationsList.map((r: any, idx: number) => (
                  <View key={r._id || idx} style={styles.regRow}>
                    <Text style={styles.regName}>{r.name}</Text>
                    <Text style={styles.regEmail}>{r.email}</Text>
                    <Text style={styles.regPhone}>{r.phone}</Text>
                    {r.notes ? <Text style={styles.regNotes}>{r.notes}</Text> : null}
                    <Text style={styles.regDate}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : ''}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.regCloseBtn} onPress={() => setRegistrationsEvent(null)}>
              <Text style={styles.regCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  backButton: { fontSize: 24, color: '#1E3A8A' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
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
  tabActive: { borderBottomColor: '#1E3A8A' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#1E3A8A', fontWeight: '600' },
  listContainer: { flex: 1 },
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
  cityInput: {
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
  filterChipsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: '#1E3A8A' },
  chipText: { fontSize: 13, color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },
  refreshBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  list: { padding: 15 },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventThumb: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 48 },
  eventInfo: { marginBottom: 10 },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  eventMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusInactive: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10 },
  regBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  regBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  actionBtn: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  formContainer: { flex: 1, padding: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  uploadPhotoBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadPhotoBtnSecondary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  uploadPhotoBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  uploadPhotoBtnTextSecondary: { fontSize: 15, fontWeight: '600', color: '#1E3A8A' },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  photoPreviewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
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
  checkRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  checkOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkSelected: { borderColor: '#1E3A8A', backgroundColor: '#EFF6FF' },
  checkText: { fontSize: 14, color: '#6B7280' },
  checkTextSelected: { color: '#1E3A8A', fontWeight: '600' },
  submitButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', marginBottom: 20 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  hintText: { fontSize: 14, color: '#9CA3AF' },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  regModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  regModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  regModalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  regScroll: { maxHeight: 360 },
  regRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  regName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  regEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  regPhone: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  regNotes: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontStyle: 'italic' },
  regDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  regEmpty: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 24 },
  regCloseBtn: { marginTop: 16, paddingVertical: 12, alignItems: 'center' },
  regCloseText: { fontSize: 16, fontWeight: '600', color: '#1E3A8A' },
});

export default AdminPetEventsScreen;
