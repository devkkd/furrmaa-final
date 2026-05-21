import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [serviceUpdates, setServiceUpdates] = useState(true);
  const [lostFound, setLostFound] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);

  const [locationAccess, setLocationAccess] = useState(true);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  const SettingItem = ({
    title,
    description,
    value,
    onChange,
  }: {
    title: string;
    description: string;
    value: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <View style={styles.card}>
      <View style={styles.textWrap}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#8E939A', true: '#95E562' }}
        thumbColor={value ? '#000000' : '#000000'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>

      <SettingItem
        title="Push Notifications"
        description="Enable or disable app notifications."
        value={pushNotifications}
        onChange={setPushNotifications}
      />

      <SettingItem
        title="Service Updates"
        description="Receive updates on vet services, events, and offers."
        value={serviceUpdates}
        onChange={setServiceUpdates}
      />

      <SettingItem
        title="Lost & Found Alerts"
        description="Get notified when lost pets are reported near you."
        value={lostFound}
        onChange={setLostFound}
      />

      <SettingItem
        title="Order & Request Updates"
        description="Stay informed about your service requests and order status."
        value={orderUpdates}
        onChange={setOrderUpdates}
      />

      {/* Location */}
      <Text style={styles.sectionTitle}>Location</Text>

      <SettingItem
        title="Location Access"
        description="Manage permission for finding nearby services."
        value={locationAccess}
        onChange={setLocationAccess}
      />

      <SettingItem
        title="Use Current Location"
        description="Allow the app to detect your location automatically."
        value={useCurrentLocation}
        onChange={setUseCurrentLocation}
      />
    </ScrollView>
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
    width: 30,
    height: 30,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '600',
  },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textWrap: {
    flex: 1,
    marginRight: 12,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  itemDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});

export default SettingsScreen;