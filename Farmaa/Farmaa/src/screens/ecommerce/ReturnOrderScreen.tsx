import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';

const ReturnOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = (route.params as any) || {};

  const [selectedReason, setSelectedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const orderId = order?._id;
  const firstItem = order?.items?.[0];
  const productName = firstItem?.product?.name || 'Product';
  const productImage = firstItem?.product?.images?.[0];

  const returnReasons = [
    'Received a damaged product',
    'Wrong item delivered',
    'Missing parts or accessories',
    'Poor quality or defective',
    'Not as described',
    'Other (write your reason)',
  ];

  const handleSubmit = async () => {
    if (!selectedReason || !orderId) {
      Alert.alert('Error', orderId ? 'Select a return reason' : 'Order not found');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.CLIENT.post(`${api.ENDPOINTS.ORDERS}/${orderId}/return`, {
        reason: selectedReason,
      });
      Alert.alert(
        'Return requested',
        res.data?.message || 'Your return request has been submitted',
        [
          {
            text: 'OK',
            onPress: () =>
              (navigation as any).navigate('OrderDetail', {
                orderId,
                order: res.data?.order,
              }),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Could not submit return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.orderId}>
            Order ID: {(orderId || '').slice(-8).toUpperCase() || '—'}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.productRow}>
            <View style={styles.productImage}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.productImg} />
              ) : (
                <Text style={styles.productEmoji}>🦴</Text>
              )}
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Return Reason</Text>
          {returnReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonOption}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={styles.radioContainer}>
                <View
                  style={[styles.radio, selectedReason === reason && styles.radioSelected]}
                >
                  {selectedReason === reason && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || submitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit →</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 5 },
  backIcon: { fontSize: 24, color: '#1F2937' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  placeholder: { width: 34 },
  section: { padding: 20 },
  orderId: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  productImg: { width: 80, height: 80, borderRadius: 8 },
  productEmoji: { fontSize: 40 },
  productName: { flex: 1, fontSize: 14, color: '#1F2937', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  reasonOption: { marginBottom: 15 },
  radioContainer: { flexDirection: 'row', alignItems: 'center' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { borderColor: '#1E3A8A' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1E3A8A' },
  reasonText: { fontSize: 14, color: '#374151', flex: 1 },
  submitButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#9CA3AF' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  bottomPadding: { height: 40 },
});

export default ReturnOrderScreen;
