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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface VetServiceTypeItem {
  _id: string;
  name: string;
  slug?: string;
  source: string;
  order: number;
  isActive?: boolean;
}

const SOURCE_OPTIONS = [
  { value: 'veterinarian', label: 'Veterinarian' },
  { value: 'service_provider', label: 'Service Provider (Pet Shops, Hospitals, etc.)' },
  { value: 'cremation', label: 'Pet Cremation' },
];

/** 8 standard filter types (All chhod ke) – inhe select karke add karne se App/Web filter sahi kaam karega */
const STANDARD_VET_TYPES = [
  { name: 'Veterinarians', slug: 'Veterinarians', source: 'veterinarian' as const, order: 1 },
  { name: 'Pet Shops', slug: 'Pet Shops', source: 'service_provider' as const, order: 2 },
  { name: 'Hospitals', slug: 'Hospitals', source: 'service_provider' as const, order: 3 },
  { name: 'Pet Hotels / Hostels', slug: 'Pet Hotels / Hostels', source: 'service_provider' as const, order: 4 },
  { name: 'NGOs', slug: 'NGOs', source: 'service_provider' as const, order: 5 },
  { name: 'Shelters', slug: 'Shelters', source: 'service_provider' as const, order: 6 },
  { name: 'Rescue Centers', slug: 'Rescue Centers', source: 'service_provider' as const, order: 7 },
  { name: 'Pet Cremation', slug: 'Pet Cremation', source: 'cremation' as const, order: 8 },
];

const AdminVetServiceTypesScreen = () => {
  const navigation = useNavigation();
  const [types, setTypes] = useState<VetServiceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', source: 'service_provider', order: '0' });

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.CLIENT.get(api.ENDPOINTS.ADMIN.VET_SERVICE_TYPES);
      setTypes(res.data.types || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load types');
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', slug: '', source: 'service_provider', order: '0' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    try {
      setLoading(true);
      await api.CLIENT.post(api.ENDPOINTS.ADMIN.VET_SERVICE_TYPES, {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.trim(),
        source: formData.source,
        order: parseInt(formData.order, 10) || 0,
      });
      Alert.alert('Success', 'Type added');
      resetForm();
      fetchTypes();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: VetServiceTypeItem) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      slug: item.slug || item.name,
      source: item.source,
      order: String(item.order ?? 0),
    });
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.name.trim()) return;
    try {
      setLoading(true);
      await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.VET_SERVICE_TYPES}/${editingId}`, {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.trim(),
        source: formData.source,
        order: parseInt(formData.order, 10) || 0,
      });
      Alert.alert('Success', 'Type updated');
      resetForm();
      fetchTypes();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Type', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.VET_SERVICE_TYPES}/${id}`);
            Alert.alert('Success', 'Type deleted');
            fetchTypes();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const addStandardType = async (preset: typeof STANDARD_VET_TYPES[0]) => {
    const exists = types.some((t) => t.name === preset.name);
    if (exists) {
      Alert.alert('Already added', `"${preset.name}" is already in the list.`);
      return;
    }
    try {
      setLoading(true);
      await api.CLIENT.post(api.ENDPOINTS.ADMIN.VET_SERVICE_TYPES, {
        name: preset.name,
        slug: preset.slug,
        source: preset.source,
        order: preset.order,
      });
      Alert.alert('Added', `"${preset.name}" added. Filter will show this on App/Web.`);
      fetchTypes();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vet Service Types</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <Text style={styles.hint}>
          These types appear as filters on Vet Services (Web & App). Add types like Vet Shop, Hospitals, Pet Shops, etc.
        </Text>

        <View style={styles.presetBlock}>
          <Text style={styles.presetTitle}>Add standard type (filter ke liye – select karke add karo)</Text>
          <View style={styles.presetRow}>
            {STANDARD_VET_TYPES.map((preset) => {
              const alreadyAdded = types.some((t) => t.name === preset.name);
              return (
                <TouchableOpacity
                  key={preset.name}
                  style={[styles.presetChip, alreadyAdded && styles.presetChipAdded]}
                  onPress={() => addStandardType(preset)}
                  disabled={loading || alreadyAdded}
                >
                  <Text style={[styles.presetChipText, alreadyAdded && styles.presetChipTextAdded]} numberOfLines={1}>
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showForm ? (
          <View style={styles.formBlock}>
            <Text style={styles.formTitle}>{editingId ? 'Edit Type' : 'Add Type'}</Text>
            <Text style={styles.fieldLabel}>Name (shown to user)</Text>
            <AdminTextInput
              style={styles.input}
              placeholder="e.g. Pet Shops"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <Text style={styles.fieldLabel}>Slug (for API, optional)</Text>
            <AdminTextInput
              style={styles.input}
              placeholder="e.g. Pet Shops"
              value={formData.slug}
              onChangeText={(t) => setFormData({ ...formData, slug: t })}
            />
            <Text style={styles.fieldLabel}>Source</Text>
            <View style={styles.sourceRow}>
              {SOURCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.sourceOpt, formData.source === opt.value && styles.sourceOptActive]}
                  onPress={() => setFormData({ ...formData, source: opt.value })}
                >
                  <Text
                    style={[styles.sourceOptText, formData.source === opt.value && styles.sourceOptTextActive]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Order (number)</Text>
            <AdminTextInput
              style={styles.input}
              placeholder="0"
              value={formData.order}
              onChangeText={(t) => setFormData({ ...formData, order: t })}
              keyboardType="numeric"
            />
            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.submitBtn} onPress={editingId ? handleUpdate : handleAdd} disabled={loading}>
                <Text style={styles.submitBtnText}>{editingId ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.addButton} onPress={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', slug: '', source: 'service_provider', order: String(types.length) }); }}>
            <Text style={styles.addButtonText}>+ Add Type</Text>
          </TouchableOpacity>
        )}

        {loading && types.length === 0 ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.list}>
            <Text style={styles.listTitle}>Current types ({types.length})</Text>
            {types.map((item) => (
              <View key={item._id} style={styles.typeCard}>
                <View style={styles.typeInfo}>
                  <Text style={styles.typeName}>{item.name}</Text>
                  <Text style={styles.typeMeta}>{item.source} • order: {item.order}</Text>
                </View>
                <View style={styles.typeActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item._id, item.name)}>
                    <Text style={styles.delBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { fontSize: 24, color: '#1E3A8A' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1 } as any,
  contentInner: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 12, color: '#6B7280', marginBottom: 16 },
  presetBlock: { marginBottom: 20 },
  presetTitle: { fontSize: 12, color: '#6B7280', marginBottom: 10, fontWeight: '600' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  presetChipAdded: { backgroundColor: '#D1FAE5', borderColor: '#059669', opacity: 0.9 },
  presetChipText: { fontSize: 12, fontWeight: '600', color: '#1E3A8A' },
  presetChipTextAdded: { color: '#059669' },
  formBlock: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sourceRow: { marginTop: 8, gap: 8 },
  sourceOpt: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F3F4F6' },
  sourceOptActive: { backgroundColor: '#1E3A8A' },
  sourceOptText: { fontSize: 12, color: '#6B7280' },
  sourceOptTextActive: { color: '#FFF' },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  submitBtn: { flex: 1, backgroundColor: '#1E3A8A', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '600' },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center' },
  cancelBtnText: { color: '#6B7280', fontWeight: '600' },
  addButton: { backgroundColor: '#1E3A8A', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  list: {},
  listTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  typeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeInfo: { flex: 1 },
  typeName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  typeMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  typeActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#1E3A8A', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  editBtnText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  delBtn: { backgroundColor: '#DC2626', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  delBtnText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
  errorText: { fontSize: 14, color: '#DC2626', marginTop: 12 },
});

export default AdminVetServiceTypesScreen;
