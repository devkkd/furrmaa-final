import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import leftArrow from '../../assets/images/arrow-left.png';
import { useNavigation } from '@react-navigation/core';

const TermsOfServiceScreen: React.FC = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By using the Furrmaa mobile application and/or website (the “Service”),
          you agree to be bound by these Terms of Service (“Terms”). If you do not
          agree, please do not use the Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old (or of legal age in your jurisdiction)
          to use the Service. By using Furrmaa you confirm you satisfy this
          requirement.
        </Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use certain parts of the Service (e.g., managing pet profiles,
          placing requests, using chat), you may need to create an account.
        </Text>
        <Text style={styles.paragraph}>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity on your account.
        </Text>
        <Text style={styles.paragraph}>
          You agree to provide accurate, current, and complete information.
        </Text>

        <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to misuse the Service. Prohibited behavior includes (but
          is not limited to):
        </Text>
        <Text style={styles.bullet}>• Posting false or misleading information.</Text>
        <Text style={styles.bullet}>
          • Uploading content you do not own or that violates the rights of
          others.
        </Text>
        <Text style={styles.bullet}>
          • Using the Service for unlawful purposes.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    marginRight: 10,
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
    marginBottom: 6,
    marginTop: 12,
    color: '#111827',
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 10,
    marginBottom: 8,
  },
});

export default TermsOfServiceScreen;