import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddReminderScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'other',
    date: new Date(),
    time: '08:00',
    recurring: 'none',
    petId: '',
    notes: '',
  });
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [showTimePicker, setShowTimePicker] = useState(false);
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.USER_PETS);
      setPets(response.data?.pets || []);
    } catch (error: any) {
      console.error('Failed to fetch pets:', error);
    }
  };

  const saveReminder = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Reminder title is required');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to create a reminder');
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        date: formData.date.toISOString(),
        time: formData.time,
        recurring: formData.recurring,
        notes: formData.notes.trim() || undefined,
      };

      if (formData.petId) {
        payload.pet = formData.petId;
      }

      const response = await api.CLIENT.post(api.ENDPOINTS.REMINDERS, payload);

      if (response.data?.reminder) {
        Alert.alert('Success', 'Reminder created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error('Failed to save reminder:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reminderTypes = [
    { value: 'feeding', label: '🍽️ Feeding' },
    { value: 'medication', label: '💊 Medication' },
    { value: 'grooming', label: '✂️ Grooming' },
    { value: 'vaccination', label: '💉 Vaccination' },
    { value: 'vet_visit', label: '🏥 Vet Visit' },
    { value: 'exercise', label: '🏃 Exercise' },
    { value: 'other', label: '⏰ Other' },
  ];

  const recurringOptions = [
    { value: 'none', label: 'Once' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Reminder</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g., Morning Feeding"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Add description (optional)"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeGrid}>
            {reminderTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  formData.type === type.value && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: type.value })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {pets.length > 0 && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pet (Optional)</Text>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet._id}
                style={[
                  styles.petOption,
                  formData.petId === pet._id && styles.petOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, petId: pet._id })}
              >
                <Text
                  style={[
                    styles.petOptionText,
                    formData.petId === pet._id && styles.petOptionTextSelected,
                  ]}
                >
                  {pet.type === 'dog' ? '🐕' : '🐱'} {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.date.toISOString().split('T')[0]}
            onChangeText={(text) => {
              const date = new Date(text);
              if (!isNaN(date.getTime())) {
                setFormData({ ...formData, date });
              }
            }}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.time}
            onChangeText={(text) => setFormData({ ...formData, time: text })}
            placeholder="e.g., 08:00 or 08:00 AM"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.recurringRow}>
            {recurringOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.recurringButton,
                  formData.recurring === option.value && styles.recurringButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, recurring: option.value })}
              >
                <Text
                  style={[
                    styles.recurringButtonText,
                    formData.recurring === option.value && styles.recurringButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Additional notes (optional)"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveReminder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Reminder</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  petOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  petOptionSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#1E3A8A',
  },
  petOptionText: {
    fontSize: 14,
    color: '#333',
  },
  petOptionTextSelected: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
  recurringRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recurringButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  recurringButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  recurringButtonText: {
    fontSize: 13,
    color: '#333',
  },
  recurringButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddReminderScreen;

