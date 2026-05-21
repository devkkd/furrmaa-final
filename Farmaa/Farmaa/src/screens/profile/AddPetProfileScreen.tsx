import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  createPet,
  uploadPetImage,
  parseAgeLabelToYears,
} from '../../services/petService';
import leftArrow from '../../assets/images/arrow-left.png';
import profilePlaceholder from '../../assets/images/pet.png';
import petIcon1 from '../../assets/images/DogFace.png';
import petIcon2 from '../../assets/images/CatFace.png';

const AddPetProfileScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 5;
  const [petType, setPetType] = useState<'Dog' | 'Cat'>('Dog');
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('6 Months');
  const [petImage, setPetImage] = useState<string | null>(null);
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

  const handleUploadImage = async () => {
    try {
      const url = await uploadPetImage();
      if (url) setPetImage(url);
    } catch (e: any) {
      Alert.alert('Upload failed', e.message || 'Try again');
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    if (!petName.trim()) {
      Alert.alert('Error', 'Pet name is required');
      return;
    }
    setSaving(true);
    try {
      await createPet({
        name: petName.trim(),
        type: petType.toLowerCase(),
        age: parseAgeLabelToYears(petAge),
        images: petImage ? [petImage] : [],
      });
      Alert.alert('Success', 'Pet profile created', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not create pet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={leftArrow} style={styles.backIcon} />
          </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pet Profile</Text>
        <Text style={styles.progressText}>
          ({currentStep}/{totalSteps})
        </Text>
         </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePicturePlaceholder}>
            <Image source={profilePlaceholder} style={styles.pawIcon} />
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

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!petName.trim() || !petAge) && styles.addButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!petName.trim() || !petAge}
        >
          <Text
            style={[
              styles.addButtonText,
              (!petName.trim() || !petAge) && styles.addButtonTextDisabled,
            ]}
          >
            Add Pet Profile →
          </Text>
        </TouchableOpacity>
      </View>
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
    color: '#0E0E0E',
  },
  progressText: {
    fontSize: 16,
    color: '#0E0E0E',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#D9DCE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pawIcon: {
    width: 30,
    height: 30,
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
    justifyContent: 'flex-start',
  },
  petTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 26,
    borderRadius: 30,
    backgroundColor: '#D9DCE2',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  petTypeButtonSelected: {
    backgroundColor: '#1F2E46',
    borderColor: '#1E3A8A',
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
    color: '#FFFFFF',
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
    borderRadius: 30,
    backgroundColor: '#D9DCE2',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  ageButtonSelected: {
    backgroundColor: '#1F2E46',
    borderColor: '#1F2E46',
  },
  ageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  ageButtonTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#1F2E46',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 60,
  },
  addButtonDisabled: {
    backgroundColor: '#8E939A',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButtonTextDisabled: {
    color: '#ffffff',
  },
});

export default AddPetProfileScreen;

