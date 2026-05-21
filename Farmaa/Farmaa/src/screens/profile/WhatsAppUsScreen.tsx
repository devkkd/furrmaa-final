import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WhatsAppUsScreen = () => {
  const navigation = useNavigation();
  const whatsappNumber = '+919876543210'; // Replace with your WhatsApp number
  const defaultMessage = 'Hello, I need help with Furrmaa app.';

  const openWhatsApp = (message: string = defaultMessage) => {
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to WhatsApp Web
          const webUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not open WhatsApp. Please make sure WhatsApp is installed.');
        console.error('Error opening WhatsApp:', err);
      });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp Us</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Chat with us on WhatsApp</Text>
          <Text style={styles.infoText}>
            Have a question or need help? Send us a message on WhatsApp and we'll respond as soon as possible.
          </Text>
          <Text style={styles.phoneText}>Phone: {whatsappNumber}</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => openWhatsApp()}
          >
            <Text style={styles.whatsappIcon}>💬</Text>
            <Text style={styles.whatsappButtonText}>Start WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openWhatsApp('I have a question about my order.')}
          >
            <Text style={styles.actionText}>📦 Order Inquiry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openWhatsApp('I need help with my account.')}
          >
            <Text style={styles.actionText}>👤 Account Help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openWhatsApp('I want to report an issue.')}
          >
            <Text style={styles.actionText}>⚠️ Report Issue</Text>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  quickActions: {
    gap: 15,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  whatsappIcon: {
    fontSize: 24,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default WhatsAppUsScreen;








