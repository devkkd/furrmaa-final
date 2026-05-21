import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import leftArrow from '../../assets/images/arrow-left.png';

const PrivacyPolicy = ({  }) => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.paragraph}>
          We respect your privacy and are committed to protecting your personal
          data. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use Furmaa.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Account Information:</Text> name, email
          address, phone number, password.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Pet Information:</Text> pet name, pet profile
          data, photos, characteristics (breed, age, etc.).
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Usage Data:</Text> app usage, features used,
          preferences, logs.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Location Data:</Text> if you grant permission,
          to provide nearby services and location-based recommendations.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Communications:</Text> messages to us via chat,
          support requests, feedback.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>

        <Text style={styles.paragraph}>We use your data to:</Text>

        <Text style={styles.paragraph}>
          • Provide and manage the services (pet profiles, vet/clinic search,
          chat, adoption, cremation requests, events).
        </Text>

        <Text style={styles.paragraph}>
          • Facilitate payments and service bookings.
        </Text>

        <Text style={styles.paragraph}>
          • Improve and personalize user experience (recommend services, show
          relevant content).
        </Text>

        <Text style={styles.paragraph}>
          • Communicate with you (updates, support, notifications).
        </Text>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 50,
  },
  back: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 14,
  },
  bold: {
    fontWeight: '600',
  },
});

export default PrivacyPolicy;