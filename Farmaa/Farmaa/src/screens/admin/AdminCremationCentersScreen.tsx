import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { pickAndUploadImage } from '../../utils/imageUpload';
import AdminTextInput from './AdminTextInput';

interface CremationCenter {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  image?: string;
  description?: string;
  isActive: boolean;
}

const AdminCremationCentersScreen = () => {
  const navigation = useNavigation();
  const [centers, setCenters] = useState<CremationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<CremationCenter | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    image: '',
    description: '',
    isActive: true,
  });

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.ADMIN.CREMATION_CENTERS);
      setCenters(res.data?.centers || []);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load centers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      image: '',
      description: '',
      isActive: true,
    });
  };

  const openAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (c: CremationCenter) => {
    setEditing(c);
    setForm({
      name: c.name || '',
      address: c.address || '',
      city: c.city || '',
      state: c.state || '',
      phone: c.phone || '',
      image: c.image || '',
      description: c.description || '',
      isActive: c.isActive !== false,
    });
    setModalVisible(true);
  };

  const handleUploadImage = async () => {
    setUploading(true);
    try {
      const result = await pickAndUploadImage('furmaa/cremation-centers');
      if (result?.url) setForm((f) => ({ ...f, image: result.url }));
    } catch (e: any) {
      Alert.alert('Upload', e.message || 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim()) {
      Alert.alert('Error', 'Name, address, city and state are required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      phone: form.phone.trim() || undefined,
      image: form.image.trim() || undefined,
      description: form.description.trim() || undefined,
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.CREMATION_CENTERS}/${editing._id}`, payload);
        Alert.alert('Success', 'Center updated');
      } else {
        await api.CLIENT.post(api.ENDPOINTS.ADMIN.CREMATION_CENTERS, payload);
        Alert.alert('Success', 'Center added — visible in app by city');
      }
      setModalVisible(false);
      resetForm();
      fetchCenters();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this cremation center?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.CREMATION_CENTERS}/${id}`);
            fetchCenters();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: CremationCenter }) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.thumb} />
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardMeta}>
          {item.city}, {item.state} · {item.isActive ? 'Active' : 'Hidden'}
        </Text>
        <Text style={styles.cardAddr} numberOfLines={2}>
          {item.address}
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item._id)}>
            <Text style={styles.delBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cremation Centers</Text>
        <TouchableOpacity onPress={openAdd}>
          <Text style={styles.add}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={centers}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No centers yet. Add one for your city.</Text>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editing ? 'Edit Center' : 'Add Center'}</Text>
          {['name', 'address', 'city', 'state', 'phone'].map((key) => (
            <AdminTextInput
              key={key}
              style={styles.input}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={(form as any)[key]}
              onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
            />
          ))}
          <AdminTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
            multiline
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadImage} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.uploadBtnText}>{form.image ? 'Change image' : 'Upload image'}</Text>
            )}
          </TouchableOpacity>
          {form.image ? <Image source={{ uri: form.image }} style={styles.preview} /> : null}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show in app (active)</Text>
            <Switch value={form.isActive} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  back: { fontSize: 24, color: '#1E3A8A', marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1F2937' },
  add: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  thumb: { width: 80, height: 80 },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  cardMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  cardAddr: { fontSize: 12, color: '#374151', marginTop: 4 },
  row: { flexDirection: 'row', marginTop: 10, gap: 8 },
  editBtn: { backgroundColor: '#E0E7FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#3730A3', fontWeight: '600', fontSize: 12 },
  delBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  delBtnText: { color: '#B91C1C', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  modal: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#FFF' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  uploadBtn: {
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadBtnText: { color: '#FFF', fontWeight: '600' },
  preview: { width: '100%', height: 120, borderRadius: 8, marginBottom: 12 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  switchLabel: { fontSize: 15, color: '#1F2937' },
  saveBtn: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#6B7280' },
});

export default AdminCremationCentersScreen;
