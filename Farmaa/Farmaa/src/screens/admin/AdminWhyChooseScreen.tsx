import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import AdminTextInput from './AdminTextInput';

interface WhyFeature {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
}

const AdminWhyChooseScreen = () => {
  const navigation = useNavigation();
  const [features, setFeatures] = useState<WhyFeature[]>([]);
  const [tagline, setTagline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '', displayOrder: '0' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.ADMIN.WHY_CHOOSE);
      setFeatures(res.data?.features || []);
      setTagline(res.data?.tagline || '');
    } catch {
      Alert.alert('Error', 'Failed to load why-choose section');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveTagline = async () => {
    try {
      setSaving(true);
      await api.CLIENT.put(api.ENDPOINTS.ADMIN.WHY_CHOOSE_SETTINGS, { tagline });
      Alert.alert('Saved', 'Tagline updated');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save tagline');
    } finally {
      setSaving(false);
    }
  };

  const saveFeature = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      setSaving(true);
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        displayOrder: parseInt(form.displayOrder, 10) || 0,
        isActive: true,
      };
      if (editingId) {
        await api.CLIENT.patch(`${api.ENDPOINTS.ADMIN.WHY_CHOOSE}/${editingId}`, body);
      } else {
        await api.CLIENT.post(api.ENDPOINTS.ADMIN.WHY_CHOOSE, body);
      }
      setForm({ title: '', description: '', image: '', displayOrder: '0' });
      setEditingId(null);
      load();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const deleteFeature = (id: string) => {
    Alert.alert('Delete', 'Remove this feature?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.CLIENT.delete(`${api.ENDPOINTS.ADMIN.WHY_CHOOSE}/${id}`);
            load();
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1F2E46" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Why Choose Furrmaa</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Section tagline</Text>
      <AdminTextInput
        value={tagline}
        onChangeText={setTagline}
        placeholder="Tagline under feature icons"
        multiline
      />
      <TouchableOpacity style={styles.btn} onPress={saveTagline} disabled={saving}>
        <Text style={styles.btnText}>Save tagline</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 24 }]}>{editingId ? 'Edit feature' : 'Add feature'}</Text>
      <AdminTextInput value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} placeholder="Title" multiline />
      <AdminTextInput value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} placeholder="Description (optional)" multiline />
      <AdminTextInput value={form.image} onChangeText={(t) => setForm({ ...form, image: t })} placeholder="Image URL" />
      <AdminTextInput value={form.displayOrder} onChangeText={(t) => setForm({ ...form, displayOrder: t })} placeholder="Order (0,1,2...)" keyboardType="numeric" />
      <TouchableOpacity style={styles.btn} onPress={saveFeature} disabled={saving}>
        <Text style={styles.btnText}>{editingId ? 'Update feature' : 'Add feature'}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 24 }]}>Current features ({features.length})</Text>
      {features.map((f) => (
        <View key={f._id} style={styles.card}>
          {f.image ? <Image source={{ uri: f.image }} style={styles.thumb} resizeMode="contain" /> : null}
          <Text style={styles.cardTitle}>{f.title}</Text>
          {f.description ? <Text style={styles.cardDesc}>{f.description}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => {
                setEditingId(f._id);
                setForm({
                  title: f.title,
                  description: f.description || '',
                  image: f.image || '',
                  displayOrder: String(f.displayOrder ?? 0),
                });
              }}
            >
              <Text style={styles.link}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteFeature(f._id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingTop: 40 },
  back: { fontSize: 24, color: '#1F2937' },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  btn: { backgroundColor: '#1F2E46', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 12 },
  thumb: { width: 56, height: 56, marginBottom: 8 },
  cardTitle: { fontSize: 14, color: '#1F2937', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 16 },
  link: { color: '#1F2E46', fontWeight: '600' },
  delete: { color: '#DC2626', fontWeight: '600' },
});

export default AdminWhyChooseScreen;
