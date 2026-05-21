import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { pickAndUploadImage } from '../../utils/imageUpload';
import leftArrow from '../../assets/images/arrow-left.png';
import profileIcon from '../../assets/images/profile.png';
import delete2Icon from '../../assets/images/trash-2.png';

const normalizePhoneDigits = (value?: string | null) => {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length <= 10) return digits;
  return digits.slice(-10);
};

const MyAccountScreen = () => {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(normalizePhoneDigits(user?.phone));
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const phoneInputRef = useRef<TextInput>(null);

  const savedPhoneDisplay = phone.trim() || 'Not added';

  const handleChangeNumber = () => {
    phoneInputRef.current?.focus();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const persistProfileImage = async (imageUrl: string) => {
    const url = imageUrl.trim();
    if (!url) return false;
    try {
      const response = await api.CLIENT.put(api.ENDPOINTS.USER_PROFILE, {
        profileImage: url,
      });
      const savedUrl = response.data?.user?.profileImage || url;
      setProfileImage(savedUrl);
      await refreshUser();
      return true;
    } catch (error: any) {
      console.error('Save profile image error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Could not save profile picture'
      );
      return false;
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.USER_PROFILE);
      if (response.data?.user) {
        const u = response.data.user;
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(normalizePhoneDigits(u.phone));
        setProfileImage(u.profileImage || '');
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      // Fallback to auth context user data
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(normalizePhoneDigits(user.phone));
        setProfileImage(user.profileImage || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (uploadingImage || loading) return;
    setUploadingImage(true);
    try {
      const result = await pickAndUploadImage('furmaa/users');
      if (result?.url) {
        setProfileImage(result.url);
        await persistProfileImage(result.url);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (phoneDigits && phoneDigits.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        name: name.trim(),
        email: email.trim(),
      };
      if (phoneDigits) payload.phone = phoneDigits;
      if (profileImage.trim()) payload.profileImage = profileImage.trim();

      const response = await api.CLIENT.put(api.ENDPOINTS.USER_PROFILE, payload);

      if (response.data.success) {
        const saved = response.data.user;
        if (saved?.profileImage) setProfileImage(saved.profileImage);
        if (saved?.name) setName(saved.name);
        if (saved?.email) setEmail(saved.email);
        if (saved?.phone) setPhone(normalizePhoneDigits(saved.phone));
        await refreshUser();
        Alert.alert('Success', 'Profile updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={handleUploadProfilePicture}
          disabled={uploadingImage || loading}
          activeOpacity={0.85}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarPhoto} />
          ) : (
            <Image source={profileIcon} style={styles.avatarIcon} />
          )}
          {uploadingImage && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUploadProfilePicture} disabled={uploadingImage || loading}>
          <Text style={styles.uploadText}>
            {uploadingImage
              ? 'Uploading...'
              : profileImage
                ? 'Change Profile Picture'
                : 'Upload Profile Picture'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      {/* Mobile */}
      <View style={styles.field}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.phoneRow}>
          <TextInput
            ref={phoneInputRef}
            style={styles.phoneInput}
            placeholder="Enter mobile number"
            placeholderTextColor="#A0A0A0"
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <TouchableOpacity style={styles.changeBtn} onPress={handleChangeNumber}>
            <Text style={styles.changeBtnText}>Change Number</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Type */}
      <View style={styles.accountType}>
        <Text style={styles.accountLabel}>Account Registration Type</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.accountValue}>Mobile Number</Text>
          <Text style={styles.accountSubValue}>{savedPhoneDisplay}</Text>
        </View>
      </View>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>

      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
      {/* Overlay */}
      <View style={styles.modalOverlay}>
        {/* Bottom Sheet */}
        <View style={styles.modalContainer}>
          {/* Close */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowDeleteModal(false)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Red Icon */}
          <View style={styles.deleteIcon}>
            <Image source={delete2Icon} style={styles.actionIcon} />
          </View>

          {/* Text */}
          <Text style={styles.modalTitle}>
            Delete Account Permanently
          </Text>

          <Text style={styles.modalSubtitle}>
            This action cannot be undone. All your data and pet
            information will be permanently deleted. Do you want to
            continue?
          </Text>

          {/* Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                setShowDeleteModal(false);
                // deleteAccount()
              }}
            >
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
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
    overflow: 'hidden',
  },
  avatarPhoto: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarIcon: {
    width: 36,
    height: 36,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 45,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
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
    gap: 10,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1F2E46',
  },
  changeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#1F2E46',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'flex-end',
},

modalContainer: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: 20,
},

closeBtn: {
  position: 'absolute',
  top: 14,
  right: 14,
  zIndex: 1,
  borderWidth: 2,
  borderColor: '#000000',
  borderRadius: 999,
  paddingHorizontal: 6,
  paddingVertical: 2,
},
closeText: {
  fontSize: 18,
  color: '#6B7280',
},

logoutIcon: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#1F2E46',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
},
logoutIconText: {
  color: '#FFFFFF',
  fontSize: 20,
},
modalIcon: {
  tintColor: '#FFFFFF',
},
modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 10,
},

modalSubtitle: {
  fontSize: 14,
  color: '#000000',
  marginBottom: 20,
},

modalActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

cancelBtn: {
  flex: 1,
  paddingVertical: 14,
  // alignItems: 'center',
  marginRight: 15,
},
cancelText: {
  fontSize: 15,
  fontWeight: '500',
},

logoutBtn: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 30,
  backgroundColor: '#1F2E46',
  alignItems: 'center',

},
logoutText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#FFFFFF',
},
deleteIcon: {
  width: 48,
  height: 48,
  borderRadius: 30,
  backgroundColor: '#FF5A4F',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
},
deleteIconText: {
  fontSize: 20,
  color: '#FFFFFF',
},

deleteBtn: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 30,
  backgroundColor: '#FF5A4F',
  alignItems: 'center',
  paddingHorizontal: 20,
},
deleteText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#FFFFFF',
},
});

export default MyAccountScreen;

