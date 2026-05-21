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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface ExploreItem {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  content: string;
  featured: boolean;
  isActive: boolean;
  order: number;
}

const TYPES = ['article', 'video', 'tip', 'guide', 'news', 'event'];
const CATEGORIES = [
  'health',
  'care',
  'training',
  'nutrition',
  'grooming',
  'behavior',
  'adoption',
  'general',
];

const AdminExploreContentScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<ExploreItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'article',
    category: 'general',
    content: '',
    featured: false,
    isActive: true,
    order: '0',
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.ADMIN.EXPLORE_CONTENT);
      setItems(res.data?.content || []);
    } catch {
      Alert.alert('Error', 'Failed to load explore content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      type: 'article',
      category: 'general',
      content: '',
      featured: false,
      isActive: true,
      order: '0',
    });
  };

  const openEdit = (item: ExploreItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category,
      content: item.content,
      featured: !!item.featured,
      isActive: item.isActive !== false,
      order: String(item.order ?? 0),
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      Alert.alert('Error', 'Title, description and content are required');
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      category: form.category,
      content: form.content.trim(),
      featured: form.featured,
      isActive: form.isActive,
      order: parseInt(form.order, 10) || 0,
      petType: ['both'],
    };
    try {
      if (editing) {
        await api.CLIENT.put(`${api.ENDPOINTS.ADMIN.EXPLORE_CONTENT}/${editing._id}`, payload);
      } else {
        await api.CLIENT.post(api.ENDPOINTS.ADMIN.EXPLORE_CONTENT, payload);
      }
      Alert.alert('Success', editing ? 'Updated' : 'Added — shows in Explore featured');
      setModalVisible(false);
      resetForm();
      fetchItems();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.EXPLORE_CONTENT}/${id}`);
          fetchItems();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Content</Text>
        <TouchableOpacity
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.add}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.category} · {item.type} · {item.featured ? 'Featured' : ''}{' '}
                {item.isActive ? '' : '(hidden)'}
              </Text>
              <Text numberOfLines={2} style={styles.cardDesc}>
                {item.description}
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
          )}
          ListEmptyComponent={<Text style={styles.empty}>No explore content yet.</Text>}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editing ? 'Edit' : 'Add'} Explore Item</Text>
          <AdminTextInput
            style={styles.input}
            placeholder="Title"
            value={form.title}
            onChangeText={(t) => setForm((f) => ({ ...f, title: t }))}
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Short description"
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
          />
          <Text style={styles.label}>Type: {form.type}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, form.type === t && styles.chipOn]}
                onPress={() => setForm((f) => ({ ...f, type: t }))}
              >
                <Text style={form.type === t ? styles.chipTextOn : styles.chipText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.label}>Category: {form.category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, form.category === c && styles.chipOn]}
                onPress={() => setForm((f) => ({ ...f, category: c }))}
              >
                <Text style={form.category === c ? styles.chipTextOn : styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <AdminTextInput
            style={[styles.input, styles.textArea]}
            placeholder="Full content"
            value={form.content}
            onChangeText={(t) => setForm((f) => ({ ...f, content: t }))}
            multiline
          />
          <AdminTextInput
            style={styles.input}
            placeholder="Order (number)"
            value={form.order}
            onChangeText={(t) => setForm((f) => ({ ...f, order: t }))}
            keyboardType="number-pad"
          />
          <View style={styles.switchRow}>
            <Text>Featured on Explore</Text>
            <Switch value={form.featured} onValueChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
          </View>
          <View style={styles.switchRow}>
            <Text>Active</Text>
            <Switch value={form.isActive} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  add: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  cardDesc: { fontSize: 13, color: '#374151', marginTop: 6 },
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
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  chips: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  chipOn: { backgroundColor: '#1E3A8A' },
  chipText: { color: '#374151', fontSize: 12 },
  chipTextOn: { color: '#FFF', fontSize: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  saveBtn: { backgroundColor: '#1E3A8A', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#FFF', fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#6B7280' },
});

export default AdminExploreContentScreen;
