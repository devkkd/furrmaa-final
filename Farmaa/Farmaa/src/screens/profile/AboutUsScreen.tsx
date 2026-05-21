import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>
          Welcome to Furmoo – your trusted companion for all things pet care.
        </Text>
        <Text style={styles.contentText}>
          At Furmoo, we believe that every pet deserves care, respect and love.
        </Text>
        <Text style={styles.contentText}>
          Our mission is to make pet care simple, transparent, and accessible.
        </Text>
        <Text style={styles.contentText}>
          We strive to build a community of caring pet lovers...
        </Text>
        <Text style={styles.contentText}>
          Thank you for trusting Furmoo with your pet's well-being.
        </Text>
      </View>
    </ScrollView>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default AboutUsScreen;



