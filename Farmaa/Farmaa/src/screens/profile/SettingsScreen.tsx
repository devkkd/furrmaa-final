import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

const DEFAULT_SETTINGS = {
  notifications: {
    push: true,
    serviceUpdates: true,
    lostAndFound: false,
    orderUpdates: true,
  },
  location: {
    locationAccess: true,
    useCurrentLocation: true,
  },
};

/** Backend shape alag ho sakta hai — UI ke liye hamesha notifications + location ensure karo */
function normalizeSettings(raw: any) {
  const n = raw?.notifications || {};
  const loc = raw?.location || {};
  return {
    notifications: {
      push: n.push ?? DEFAULT_SETTINGS.notifications.push,
      serviceUpdates:
        n.serviceUpdates ?? n.promotions ?? DEFAULT_SETTINGS.notifications.serviceUpdates,
      lostAndFound:
        n.lostAndFound ?? n.reminders ?? DEFAULT_SETTINGS.notifications.lostAndFound,
      orderUpdates: n.orderUpdates ?? DEFAULT_SETTINGS.notifications.orderUpdates,
    },
    location: {
      locationAccess: loc.locationAccess ?? DEFAULT_SETTINGS.location.locationAccess,
      useCurrentLocation:
        loc.useCurrentLocation ?? DEFAULT_SETTINGS.location.useCurrentLocation,
    },
  };
}

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.SETTINGS);
      if (response.data?.settings) {
        setSettings(normalizeSettings(response.data.settings));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSettings = async (updatedSettings: typeof DEFAULT_SETTINGS) => {
    try {
      setLoading(true);
      const response = await api.CLIENT.put(api.ENDPOINTS.SETTINGS, updatedSettings);
      if (response.data?.settings) {
        setSettings(normalizeSettings(response.data.settings));
      }
    } catch (error: any) {
      console.error('Failed to update settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: string) => {
    const updated = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key as keyof typeof settings.notifications],
      },
    };
    setSettings(updated);
    updateSettings(updated);
  };

  const toggleLocation = (key: string) => {
    const updated = {
      ...settings,
      location: {
        ...settings.location,
        [key]: !settings.location[key as keyof typeof settings.location],
      },
    };
    setSettings(updated);
    updateSettings(updated);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Enable or disable app notifications.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.notifications.push && styles.toggleActive]}
            onPress={() => toggleNotification('push')}
          >
            <View style={[styles.toggleCircle, settings.notifications.push && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Service Updates</Text>
            <Text style={styles.settingDescription}>Receive updates on services, events, and offers.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.notifications.serviceUpdates && styles.toggleActive]}
            onPress={() => toggleNotification('serviceUpdates')}
          >
            <View style={[styles.toggleCircle, settings.notifications.serviceUpdates && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Lost & Found Alerts</Text>
            <Text style={styles.settingDescription}>Get notified when lost pets are reported near you.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.notifications.lostAndFound && styles.toggleActive]}
            onPress={() => toggleNotification('lostAndFound')}
          >
            <View style={[styles.toggleCircle, settings.notifications.lostAndFound && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Order & Request Updates</Text>
            <Text style={styles.settingDescription}>Stay informed about your service requests and order status.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.notifications.orderUpdates && styles.toggleActive]}
            onPress={() => toggleNotification('orderUpdates')}
          >
            <View style={[styles.toggleCircle, settings.notifications.orderUpdates && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Location Access</Text>
            <Text style={styles.settingDescription}>Manage permission for finding nearby services.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.location.locationAccess && styles.toggleActive]}
            onPress={() => toggleLocation('locationAccess')}
          >
            <View style={[styles.toggleCircle, settings.location.locationAccess && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Use Current Location</Text>
            <Text style={styles.settingDescription}>Allow the app to detect your location automatically.</Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, settings.location.useCurrentLocation && styles.toggleActive]}
            onPress={() => toggleLocation('useCurrentLocation')}
          >
            <View style={[styles.toggleCircle, settings.location.useCurrentLocation && styles.toggleCircleActive]} />
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});

export default SettingsScreen;



