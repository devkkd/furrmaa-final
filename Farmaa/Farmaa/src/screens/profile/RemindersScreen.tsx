import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface Reminder {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  enabled: boolean;
  type: 'feeding' | 'medication' | 'grooming' | 'vaccination' | 'other';
}

const RemindersScreen = () => {
  const navigation = useNavigation();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.REMINDERS);
      if (response.data?.success) {
        const fetchedReminders = response.data.reminders || [];
        // Map backend reminders to frontend format
        const mappedReminders = fetchedReminders.map((r: any) => ({
          _id: r._id,
          title: r.title,
          description: r.description || '',
          date: new Date(r.date).toISOString().split('T')[0],
          time: r.time || '08:00',
          enabled: r.enabled !== false,
          type: r.type || 'other',
          pet: r.pet,
        }));
        setReminders(mappedReminders);
      }
    } catch (error: any) {
      console.error('Failed to fetch reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    try {
      await api.CLIENT.put(`${api.ENDPOINTS.REMINDERS}/${id}`, { enabled });
      setReminders(reminders.map(r => r._id === id ? { ...r, enabled } : r));
    } catch (error: any) {
      console.error('Failed to update reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'feeding': return '🍽️';
      case 'medication': return '💊';
      case 'grooming': return '✂️';
      case 'vaccination': return '💉';
      default: return '⏰';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reminders</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddReminder' as never)}
          style={styles.addButton}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <Text style={styles.iconText}>{getReminderIcon(item.type)}</Text>
            </View>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>{item.title}</Text>
              <Text style={styles.reminderDescription}>{item.description}</Text>
              <Text style={styles.reminderTime}>
                {item.date} at {item.time}
              </Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={(value) => toggleReminder(item._id, value)}
              trackColor={{ false: '#D1D5DB', true: '#1E3A8A' }}
              thumbColor={item.enabled ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>No Reminders</Text>
            <Text style={styles.emptyDescription}>
              Add reminders to never miss important pet care tasks
            </Text>
            <TouchableOpacity
              style={styles.addReminderButton}
              onPress={() => navigation.navigate('AddReminder' as never)}
            >
              <Text style={styles.addReminderButtonText}>Add Reminder →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  list: {
    padding: 15,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  addReminderButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addReminderButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default RemindersScreen;



