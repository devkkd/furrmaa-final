import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import dogProduct1Image from '../../assets/images/dogProduct1.png';


const PaymentSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, expectedDelivery } = (route.params as any) || {
    orderId: '#123456',
    expectedDelivery: '3-5 Days',
  };

  const handleViewOrder = () => {
    (navigation as any).navigate('OrderDetail' as never, {
      order: {
        id: orderId,
        status: 'Placed',
        date: '22 Nov 2025',
        productName:
          'Canine Creek Club Ultra Premium Dry Dog Food for All Lifestages, 20 kg Pack',
        image: dogProduct1Image,
        price: 2449,
        discount: 220,
        deliveryFee: 0,
        totalAmount: 2229,
        paymentMethod: 'UPI',
        address: {
          name: 'John Deo',
          phone: '123456',
          address: '123, abcd arera, abcd city, abcd state',
          phoneNumber: '1234567890',
        },
      },
    } as never);
  };

  const handleContinueShopping = () => {
    navigation.navigate('ProductsTab' as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Placed - Payment Success</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
    <View style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon */}
      <View style={styles.successCircle}>
        <Text style={styles.checkmark}>✓</Text>
      </View>

      {/* Title */}
      <Text style={styles.successTitle}>
        Payment Successful! 🎉
      </Text>

      <Text style={styles.successMessage}>
        Your order is confirmed.
      </Text>

      <Text style={styles.successSubMessage}>
        Your pet's goodies are on the way. 🐾
      </Text>

      {/* Order Info */}
      <Text style={styles.orderId}>
        Order ID: #{orderId}
      </Text>

      <Text style={styles.deliveryText}>
        Expected Delivery: {expectedDelivery}
      </Text>

      {/* View Order Button */}
      <TouchableOpacity
        style={styles.viewOrderButton}
        onPress={handleViewOrder}
      >
        <Text style={styles.viewOrderText}>View Order</Text>
      </TouchableOpacity>

      {/* Continue Shopping */}
      <TouchableOpacity
        onPress={handleContinueShopping}
      >
        <Text style={styles.continueShoppingText}>
          Continue Shopping →
        </Text>
      </TouchableOpacity>
    </ScrollView>

    {/* Footer */}
    
  </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerPill}>
      <Text style={styles.footerEmoji}>🐶</Text>
      <Text style={styles.footerText}>
        Thank you for choosing Furmaa.
      </Text>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 140,
  },

  successCircle: {
    width: 65,
    height: 65,
    borderRadius: 50,
    backgroundColor: '#9AE66E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  checkmark: {
    fontSize: 38,
    color: '#0F172A',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 5,
  },
  closeIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 34,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
    textAlign: 'center',
  },

  successSubMessage: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
  },

  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  deliveryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },

  viewOrderButton: {
    backgroundColor: '#9AE66E',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 999,
    marginTop: 80,
    marginBottom: 18,
  },

  viewOrderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  continueShoppingText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    marginTop: 30,
  },

  footerPill: {
    position: 'absolute',
    bottom: 80,
    left: 50,
    right: 50,
    backgroundColor: '#9AE66E',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerEmoji: {
    fontSize: 18,
    marginRight: 8,
  },

  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },

});

export default PaymentSuccessScreen;

