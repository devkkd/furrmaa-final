import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  fetchPet,
  updatePet,
  deletePet,
  uploadPetImage,
  parseAgeLabelToYears,
  formatAgeFromYears,
} from '../../services/petService';
import leftArrow from '../../assets/images/arrow-left.png';
import petIcon1 from '../../assets/images/DogFace.png';
import petIcon2 from '../../assets/images/CatFace.png';
import deleteIcon from '../../assets/images/trash.png';
import profilePic from '../../assets/images/feedProfImage.png';

const EditPetProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const petId = (route.params as any)?.petId as string | undefined;
  const [petType, setPetType] = useState<'Dog' | 'Cat'>('Dog');
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('6 Months');
  const [petImage, setPetImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(!!petId);
  const [saving, setSaving] = useState(false);

  const ageOptions = [
    '6 Months',
    '1 Year',
    '2 Year',
    '3 Year',
    '4 Year',
    '5 Year',
    '6 Year',
  ];

  useEffect(() => {
    if (!petId) return;
    (async () => {
      try {
        setLoading(true);
        const pet = await fetchPet(petId);
        if (pet) {
          setPetName(pet.name || '');
          setPetType(pet.type === 'cat' ? 'Cat' : 'Dog');
          setPetAge(formatAgeFromYears(pet.age) || '6 Months');
          if (pet.images?.[0]) setPetImage(pet.images[0]);
        }
      } catch (e: any) {
        Alert.alert('Error', e.response?.data?.message || 'Could not load pet');
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  const handleUploadImage = async () => {
    try {
      const url = await uploadPetImage();
      if (url) setPetImage(url);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message || 'Try again');
    }
  };

  const handleSave = async () => {
    if (!petId) {
      navigation.goBack();
      return;
    }
    if (!petName.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return;
    }
    setSaving(true);
    try {
      await updatePet(petId, {
        name: petName.trim(),
        type: petType.toLowerCase(),
        age: parseAgeLabelToYears(petAge),
        images: petImage ? [petImage] : undefined,
      });
      Alert.alert('Saved', 'Pet profile updated');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!petId) return;
    setSaving(true);
    try {
      await deletePet(petId);
      setShowDeleteModal(false);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not delete pet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1F2E46" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Pet Profile</Text>
        </View>
        <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
          <Image source={deleteIcon} style={styles.deleteIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicture}>
            <Image source={profilePic} style={styles.profileEmoji} />
          </View>
          <TouchableOpacity onPress={handleUploadImage}>
            <Text style={styles.uploadText}>Upload Pet Profile Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet Type</Text>
          <View style={styles.petTypeContainer}>
            <TouchableOpacity
              style={[
                styles.petTypeButton,
                petType === 'Dog' && styles.petTypeButtonSelected,
              ]}
              onPress={() => setPetType('Dog')}
            >
              <Image source={petIcon1} style={styles.petTypeIcon} />
              <Text
                style={[
                  styles.petTypeText,
                  petType === 'Dog' && styles.petTypeTextSelected,
                ]}
              >
                Dog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.petTypeButton,
                petType === 'Cat' && styles.petTypeButtonSelected,
              ]}
              onPress={() => setPetType('Cat')}
            >
              <Image source={petIcon2} style={styles.petTypeIcon} />
              <Text
                style={[
                  styles.petTypeText,
                  petType === 'Cat' && styles.petTypeTextSelected,
                ]}
              >
                Cat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Pet Name</Text>
          <TextInput
            style={styles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="Enter Pet Name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Pet Age Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How old is your pet?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ageContainer}
          >
            {ageOptions.map((age) => (
              <TouchableOpacity
                key={age}
                style={[
                  styles.ageButton,
                  petAge === age && styles.ageButtonSelected,
                ]}
                onPress={() => setPetAge(age)}
              >
                <Text
                  style={[
                    styles.ageButtonText,
                    petAge === age && styles.ageButtonTextSelected,
                  ]}
                >
                  {age}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save →</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Pet Profile</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this pet profile? This action
              cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deleteIcon: {
    width: 30,
    height: 30,
  },
  content: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileEmoji: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  uploadText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  petTypeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  petTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 34,
    borderRadius: 30,
    backgroundColor: '#D9DCE2',
    gap: 8,
  },
  petTypeButtonSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  petTypeIcon: {
    width: 20,
    height: 20,
  },
  petTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  petTypeTextSelected: {
    color: '#ffffff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ageContainer: {
    gap: 12,
    paddingRight: 20,
  },
  ageButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  ageButtonSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  ageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  ageButtonTextSelected: {
    color: '#ffffff',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 22,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 70,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 25,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteConfirmButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default EditPetProfileScreen;

