import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';


type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
};

const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Pet Event Near You',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '2',
    title: 'Welcome to Furrmaa',
    message: 'Your trusted companion for all pet care needs.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '3',
    title: 'Pet Event Near You',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '4',
    title: 'Welcome to Furrmaa',
    message: 'Your trusted companion for all pet care needs.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '5',
    title: 'Pet Event Near You',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '6',
    title: 'Pet Event Near You',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '7',
    title: 'Pet Event Near You',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
  {
    id: '8',
    title: 'Welcome to Furrmaa',
    message: 'New pet events are happening nearby. Join the fun.',
    time: '10 Dec 2025, 11:34 am',
  },
];



const NotificationsScreen = () => {
  const navigation = useNavigation();

  const renderItem: ListRenderItem<NotificationItem> = ({ item }) => (
    <View style={styles.card}>
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.time}>{item.time}</Text>
    </View>
    );

    const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No Notifications Yet</Text>

    <Text style={styles.emptyMessage}>
      You don't have any alerts or updates right now. New
      notifications will appear here as soon as something
      needs your attention.
    </Text>

    <Text style={styles.emptyMessage}>
      Stay tuned—your pet world updates start here.
    </Text>

    <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
      <Text style={styles.refreshText}>Refresh →</Text>
    </TouchableOpacity>
  </View>
);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* List */}
      <FlatList
  data={notifications}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={
    notifications.length === 0
      ? styles.emptyListContent
      : styles.listContent
  }
  ListEmptyComponent={
    <EmptyState onRefresh={() => {
      // refetchNotifications()
    }} />
  }
/>
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 50,
  },
  backArrow: {
    width:30,
    height:30,
    marginRight:15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  listContent: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  message: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
  },

  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyListContent: {
  flexGrow: 1,
  justifyContent: 'center',
},

emptyContainer: {
  alignItems: 'center',
  paddingHorizontal: 32,
},

emptyTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 12,
  textAlign: 'center',
},

emptyMessage: {
  fontSize: 14,
  color: '#4B5563',
  textAlign: 'center',
  marginBottom: 8,
  lineHeight: 20,
},

refreshBtn: {
  marginTop: 28,
  backgroundColor: '#1F2A44',
  paddingVertical: 14,
  paddingHorizontal: 36,
  borderRadius: 28,
},

refreshText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
});

export default NotificationsScreen;