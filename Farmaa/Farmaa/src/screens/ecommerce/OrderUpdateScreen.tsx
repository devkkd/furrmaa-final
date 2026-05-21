import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const OrderUpdateScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = (route.params as any) || { orderId: '#123456' };

  const orderUpdates = [
    {
      id: 1,
      status: 'Order Placed',
      message: "We've received your order.",
      date: '22 Nov 2025',
      time: '10:45 AM',
      completed: true,
    },
    {
      id: 2,
      status: 'Packed & Ready',
      message: "Your pet's goodies are packed with care.",
      date: '22 Nov 2025',
      time: '10:45 AM',
      completed: true,
    },
    {
      id: 3,
      status: 'Shipped',
      message: 'Your order is on its way.',
      date: '22 Nov 2025',
      time: '10:45 AM',
      completed: true,
    },
    {
      id: 4,
      status: 'Out for Delivery',
      message: 'Your order is out for delivery - almost there!',
      date: '22 Nov 2025',
      time: '10:45 AM',
      completed: true,
    },
    {
      id: 5,
      status: 'Delivered',
      message: 'Delivered safely. Hope your pet loves it!',
      date: '22 Nov 2025',
      time: '10:45 AM',
      completed: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Update</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {orderUpdates.map((update, index) => (
            <View key={update.id} style={styles.updateItem}>
              <View style={styles.timeline}>
                <View
                  style={[
                    styles.timelineDot,
                    update.completed && styles.timelineDotCompleted,
                  ]}
                >
                  {update.completed && (
                    <Text style={styles.timelineCheckmark}>✓</Text>
                  )}
                </View>
                {index < orderUpdates.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      update.completed && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateStatus}>{update.status}</Text>
                <Text style={styles.updateMessage}>{update.message}</Text>
                <Text style={styles.updateDate}>
                  {update.date}, {update.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
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
  updateItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timelineCheckmark: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    minHeight: 40,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  updateContent: {
    flex: 1,
    paddingTop: 4,
  },
  updateStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  updateMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  updateDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default OrderUpdateScreen;

