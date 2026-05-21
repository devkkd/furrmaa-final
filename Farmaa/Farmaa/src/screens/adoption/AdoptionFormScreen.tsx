import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const AdoptionFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { pet } = (route.params as any) || {};
  const [formData, setFormData] = useState({
    reason: '',
    livingSituation: 'house',
    hasOtherPets: false,
    experience: '',
  });
  const [loading, setLoading] = useState(false);

  const submitForm = async () => {
    if (!pet?._id) {
      Alert.alert('Error', 'Pet information not found');
      return;
    }

    if (!formData.reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for adoption');
      return;
    }

    try {
      setLoading(true);
      const adoptionData = {
        pet: pet._id,
        reason: formData.reason.trim(),
        livingSituation: formData.livingSituation,
        hasOtherPets: formData.hasOtherPets,
        experience: formData.experience.trim() || undefined,
        status: 'pending',
      };

      const response = await api.CLIENT.post(api.ENDPOINTS.ADOPTION, adoptionData);
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Your adoption application has been submitted successfully! Admin will review it soon.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Adoption submission error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit adoption application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Adoption Application</Text>
        <Text style={styles.petName}>For {pet?.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Why do you want to adopt?</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your motivation..."
          value={formData.reason}
          onChangeText={(text) => setFormData({ ...formData, reason: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Living Situation</Text>
        <View style={styles.radioGroup}>
          {['house', 'apartment', 'other'].map((situation) => (
            <TouchableOpacity
              key={situation}
              style={[
                styles.radioButton,
                formData.livingSituation === situation && styles.radioButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, livingSituation: situation })}
            >
              <Text
                style={[
                  styles.radioText,
                  formData.livingSituation === situation && styles.radioTextActive,
                ]}
              >
                {situation.charAt(0).toUpperCase() + situation.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Do you have other pets?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, formData.hasOtherPets && styles.radioButtonActive]}
            onPress={() => setFormData({ ...formData, hasOtherPets: true })}
          >
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, !formData.hasOtherPets && styles.radioButtonActive]}
            onPress={() => setFormData({ ...formData, hasOtherPets: false })}
          >
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Previous Pet Experience</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your experience with pets..."
          value={formData.experience}
          onChangeText={(text) => setFormData({ ...formData, experience: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={submitForm}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Application</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  petName: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  radioButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  radioTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AdoptionFormScreen;

