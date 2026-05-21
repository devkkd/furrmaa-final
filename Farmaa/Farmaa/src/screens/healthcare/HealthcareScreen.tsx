import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HealthcareScreen = () => {
  const navigation = useNavigation();

  const options = [
    { id: 1, title: 'My Pets Health', icon: '🐾', screen: 'PetHealth' },
    { id: 2, title: 'Find Veterinarian', icon: '👨‍⚕️', screen: 'Veterinarians' },
    { id: 3, title: 'Vaccination Records', icon: '💉', screen: 'PetHealth' },
    { id: 4, title: 'Medical History', icon: '📋', screen: 'PetHealth' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Healthcare</Text>
      </View>

      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => navigation.navigate(option.screen as never)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={styles.optionTitle}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate('Emergency' as never)}
      >
        <Text style={styles.emergencyButtonText}>🚨 Emergency</Text>
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
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  optionIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: '#FF6B6B',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HealthcareScreen;

