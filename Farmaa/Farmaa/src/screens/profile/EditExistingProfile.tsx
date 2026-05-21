import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import profileIcon from '../../assets/images/profile.png';
import logoutIcon from '../../assets/images/logout.png';
import deleteIcon from '../../assets/images/trash.png';
import rightArrow from '../../assets/images/arrow-right1.png';

const MyAccountScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Image source={profileIcon} style={styles.avatarIcon} />
        </View>
        <Text style={styles.uploadText}>Change Profile Picture</Text>
      </View>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name"
          placeholderTextColor="#A0A0A0"
          value="Jon Doe"
            editable={true}
        />
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name"
          placeholderTextColor="#A0A0A0"
          value="Jon Doe"
            editable={true}
        />
      </View>

      {/* Mobile */}
      <View style={styles.field}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.phoneRow}>
          <TextInput
            style={styles.phoneInput}
            value="1234567890"
            editable={true}
          />
          <TouchableOpacity style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Type */}
      <View style={styles.accountType}>
        <Text style={styles.accountLabel}>Account Registration Type</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.accountValue}>Mobile Number</Text>
          <Text style={styles.accountSubValue}>1234567890</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.actionRow}>
        <Image source={logoutIcon} style={styles.actionIcon} />
        <View>
          <Text style={styles.actionTitle}>Log out</Text>
          <Text style={styles.actionSub}>Log out this account on this device</Text>
        </View>
        <Image source={rightArrow} style={styles.arrow} />
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity style={styles.actionRow}>
        <Image source={deleteIcon} style={styles.actionIcon} />
        <View>
          <Text style={[styles.actionTitle, { color: '#FF3B30' }]}>
            Delete Account
          </Text>
          <Text style={styles.actionSub}>
            Delete Your Account Permanently
          </Text>
        </View>
        <Image source={rightArrow} style={styles.arrow} />
      </TouchableOpacity>
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
    padding: 16,
    paddingTop: 50,
  },
  backArrow: {
    width: 30,
    height: 30,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  profileSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D9DCE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    width: 36,
    height: 36,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  field: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  changeBtn: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 10,
  },
  changeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  accountType: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  accountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountSubValue: {
    fontSize: 12,
    color: '#6B7280',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  arrow: {
    width: 22,
    height: 22,
    marginLeft: 'auto',
  },
});

export default MyAccountScreen;

