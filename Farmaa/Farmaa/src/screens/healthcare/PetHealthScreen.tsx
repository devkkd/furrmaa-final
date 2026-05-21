import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import {
  fetchMedicalHistory,
  addMedicalRecord,
  MedicalRecord,
} from '../../services/healthcareService';

interface Pet {
  _id: string;
  name: string;
  type: string;
  breed?: string;
  vaccinations?: { name: string; date?: string; nextDue?: string }[];
}

const PetHealthScreen = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [condition, setCondition] = useState('');
  const [treatment, setTreatment] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPets = async () => {
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.USER_PETS);
      const list = res.data?.pets || [];
      setPets(list);
      if (list.length && !selectedPetId) setSelectedPetId(list[0]._id);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (petId: string) => {
    try {
      setRecordsLoading(true);
      setRecords(await fetchMedicalHistory(petId));
    } catch {
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedPetId) loadRecords(selectedPetId);
    }, [selectedPetId])
  );

  const selectedPet = pets.find((p) => p._id === selectedPetId) || pets[0];
  const vaccinations = selectedPet?.vaccinations || [];

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN');
    } catch {
      return d;
    }
  };

  const handleAddRecord = async () => {
    if (!selectedPetId || !condition.trim()) {
      Alert.alert('Error', 'Condition is required');
      return;
    }
    setSaving(true);
    try {
      await addMedicalRecord(selectedPetId, {
        condition: condition.trim(),
        treatment: treatment.trim(),
      });
      setCondition('');
      setTreatment('');
      setShowAddModal(false);
      await loadRecords(selectedPetId);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not save record');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pet Health</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Pets</Text>
        {pets.length === 0 ? (
          <Text style={styles.emptyText}>No pets added. Add a pet from My Pets.</Text>
        ) : (
          pets.map((pet) => (
            <TouchableOpacity
              key={pet._id}
              style={[styles.petCard, selectedPet?._id === pet._id && styles.petCardActive]}
              onPress={() => setSelectedPetId(pet._id)}
            >
              <Text style={styles.petEmoji}>{pet.type === 'cat' ? '🐱' : '🐕'}</Text>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>{pet.breed || pet.type}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {selectedPetId && (
        <>
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Medical History</Text>
              <TouchableOpacity onPress={() => setShowAddModal(true)}>
                <Text style={styles.addLink}>+ Add record</Text>
              </TouchableOpacity>
            </View>
            {recordsLoading ? (
              <ActivityIndicator color="#1E3A8A" />
            ) : records.length === 0 ? (
              <Text style={styles.emptyText}>No medical records yet.</Text>
            ) : (
              records.map((rec, index) => (
                <View key={rec._id || index} style={styles.recordCard}>
                  <Text style={styles.recordTitle}>{rec.condition || 'Visit'}</Text>
                  {rec.treatment ? (
                    <Text style={styles.recordSub}>{rec.treatment}</Text>
                  ) : null}
                  <Text style={styles.recordDate}>{formatDate(rec.date)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vaccinations</Text>
            {vaccinations.length === 0 ? (
              <Text style={styles.emptyText}>No vaccination records for this pet.</Text>
            ) : (
              vaccinations.map((vacc, index) => (
                <View key={index} style={styles.vaccinationCard}>
                  <Text style={styles.vaccinationName}>{vacc.name}</Text>
                  <Text style={styles.vaccinationDate}>Last: {formatDate(vacc.date)}</Text>
                  <Text style={styles.vaccinationNext}>
                    Next Due: {formatDate(vacc.nextDue)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add medical record</Text>
            <TextInput
              style={styles.input}
              placeholder="Condition / reason"
              value={condition}
              onChangeText={setCondition}
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Treatment / notes"
              value={treatment}
              onChangeText={setTreatment}
              multiline
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleAddRecord}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  section: { padding: 20, marginTop: 15, backgroundColor: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addLink: { color: '#1E3A8A', fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#666' },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petCardActive: { borderColor: '#1E3A8A' },
  petEmoji: { fontSize: 40, marginRight: 15 },
  petInfo: { flex: 1 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  petBreed: { fontSize: 14, color: '#666' },
  recordCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  recordTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  recordSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  recordDate: { fontSize: 12, color: '#9CA3AF', marginTop: 6 },
  vaccinationCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  vaccinationName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  vaccinationDate: { fontSize: 14, color: '#666', marginBottom: 3 },
  vaccinationNext: { fontSize: 14, color: '#FF6B6B', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#1E3A8A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700' },
  cancelText: { textAlign: 'center', color: '#6B7280', paddingBottom: 20 },
});

export default PetHealthScreen;
