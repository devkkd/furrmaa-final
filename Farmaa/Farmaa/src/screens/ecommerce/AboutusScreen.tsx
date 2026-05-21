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

const AboutUsScreen: React.FC = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={leftArrow} style={styles.back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.paragraph}>
          Welcome to Furrmaa – your trusted companion for all things pet care.
        </Text>

        <Text style={styles.paragraph}>
          At Furrmaa, we believe that every pet deserves care, respect and love.
          We built this app to connect pet-owners with essential services – from
          veterinary care and pet adoption to events, pet cremation requests,
          lost & found support, and more.
        </Text>

        <Text style={styles.paragraph}>
          Our mission is to make pet care simple, transparent, and accessible.
          Whether you are looking for a vet nearby, want to create a profile for
          your pet, or want to explore adoption opportunities – Furrmaa is here
          to help.
        </Text>

        <Text style={styles.paragraph}>
          We strive to build a community of caring pet lovers: one that supports
          responsible pet ownership, helps lost and found efforts, and provides
          trustworthy access to pet-related services under one roof.
        </Text>

        <Text style={styles.paragraph}>
          Thank you for trusting Furrmaa with your pet’s well-being.
        </Text>

        {/* Repeated content as shown in image */}
        <Text style={styles.paragraph}>
          Welcome to Furrmaa – your trusted companion for all things pet care.
        </Text>

        <Text style={styles.paragraph}>
          At Furrmaa, we believe that every pet deserves care, respect and love.
          We built this app to connect pet-owners with essential services – from
          veterinary care and pet adoption to events, pet cremation requests,
          lost & found support, and more.
        </Text>

        <Text style={styles.paragraph}>
          Our mission is to make pet care simple, transparent, and accessible.
          Whether you are looking for a vet nearby, want to create a profile for
          your pet, or want to explore adoption opportunities – Furrmaa is here
          to help.
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginTop: 50,
  },
  back: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  paragraph: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 14,
  },
});
export default AboutUsScreen;