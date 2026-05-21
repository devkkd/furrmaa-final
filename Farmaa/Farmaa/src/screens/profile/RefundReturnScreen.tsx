import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RefundReturnScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund & Return Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Return Policy</Text>
          <Text style={styles.sectionText}>
            You can return most items within 7 days of delivery if they are unopened, unused, and in their original packaging.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Eligibility for Returns</Text>
          <Text style={styles.sectionText}>
            Items must be in their original condition with all tags and packaging intact. Perishable items (pet food) cannot be returned unless damaged or defective.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Return Process</Text>
          <Text style={styles.sectionText}>
            To initiate a return, go to "My Orders" section, select the order you want to return, and click "Return Order". Our team will process your request within 24-48 hours.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Refund Policy</Text>
          <Text style={styles.sectionText}>
            Once we receive and inspect the returned item, we will process your refund. Refunds will be credited to your original payment method within 5-7 business days.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Refund Methods</Text>
          <Text style={styles.sectionText}>
            Refunds are credited to your Furrmaa Wallet when admin approves your return (order status: Returned). Wallet and online (UPI/Card) payments are supported. Cash on delivery refunds are processed as per support team guidance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Exchanges</Text>
          <Text style={styles.sectionText}>
            We currently do not offer direct exchanges. If you need a different size or item, please return the original item and place a new order.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Damaged or Defective Items</Text>
          <Text style={styles.sectionText}>
            If you receive a damaged or defective item, please contact us immediately. We will arrange a free return pickup and send a replacement or provide a full refund.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cancellation Policy</Text>
          <Text style={styles.sectionText}>
            You can cancel your order before it is shipped. Once shipped, you can return it as per our return policy. Cancelled orders will be refunded within 2-3 business days.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            If you have any questions about our refund and return policy, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>Email: support@furrmaa.com</Text>
          <Text style={styles.contactPhone}>Phone: +91 9876543210</Text>
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
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  contactEmail: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    marginBottom: 5,
  },
  contactPhone: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
});

export default RefundReturnScreen;








