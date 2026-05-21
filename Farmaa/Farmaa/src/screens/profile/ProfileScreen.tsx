import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
} from 'react-native';
import api from '../../config/api';
import { WALLET_UI_ENABLED } from '../../config/featureFlags';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import sectionIcon from '../../assets/images/pet.png';
import rightArrow from '../../assets/images/arrow-right1.png';
import logo from '../../assets/images/Logo.png';
import cremationIcon from '../../assets/images/Group 202.png';
import aiChatIcon from '../../assets/images/Group 230.png';
import hopeIcon from '../../assets/images/lovely.png';
import ordersIcon from '../../assets/images/box.png';
import eventsIcon from '../../assets/images/calendar-2.png';
import profileIcon from '../../assets/images/profile.png';
import addressIcon from '../../assets/images/home.png';
import accountsIcon from '../../assets/images/moneys.png';
import settingsIcon from '../../assets/images/setting-2.png';
import notificationsIcon from '../../assets/images/notification-bing.png';
import faqIcon from '../../assets/images/message-question.png';
import feedbackIcon from '../../assets/images/like.png';
import chatUsIcon from '../../assets/images/message-text.png';
import termsIcon from '../../assets/images/judge.png';
import privacyIcon from '../../assets/images/document.png';
import aboutUsIcon from '../../assets/images/information.png';
import versionIcon from '../../assets/images/happyemoji.png';
import rateUsIcon from '../../assets/images/star.png';
import kontentKraftIcon from '../../assets/images/Vector-2.png';
import heartIcon from '../../assets/images/heart.png';
import clockIcon from '../../assets/images/clock.png';
import logoutIcon from '../../assets/images/logout.png';
const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user, logout, refreshUser } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      api.CLIENT.get(api.ENDPOINTS.NOTIFICATIONS)
        .then((res) => {
          const data = res.data || {};
          setUnreadNotifications(data.unreadCount ?? data.count ?? 0);
        })
        .catch(() => setUnreadNotifications(0));
    }, [refreshUser])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              console.error('Logout failed:', e);
              Alert.alert('Error', 'Could not complete logout. Please try again.');
            }
          },
        },
      ]
    );
  };
  const handleAdminPanel = () => {
    if (!isAdmin) {
      Alert.alert('Access denied', 'Admin panel is only available for admin accounts.');
      return;
    }
    (navigation as any).navigate('AdminDashboard');
  };


  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        {unreadNotifications > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </Text>
          </View>
        )}
      </View>

      {/* Profile Section */}
      <TouchableOpacity
        style={styles.profileBanner}
        onPress={() => (navigation as any).navigate('EditProfile', {})}
      >
        <View style={styles.profileIconContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profilePhoto} />
          ) : (
            <Image source={profileIcon} style={styles.profileIcon} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileGreeting}>Hi, {user?.name?.split(' ')[0] || 'User'}</Text>
          <Text style={styles.profileAction}>View My Profile</Text>
        </View>
        <Image source={rightArrow} style={styles.arrowIcon}/>
      </TouchableOpacity>

      {/* Quick Links Grid */}
      <View style={styles.quickLinksCard}>
        <View style={styles.quickLinksGrid}>
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('Orders' as never)}
          >
            <Image source={ordersIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>My Orders</Text>
            <Text style={styles.serviceSubtitle}>View all your orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (navigation as any).navigate('Wishlist', {})}
          >
            <Image source={heartIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>My Wishlist</Text>
            <Text style={styles.serviceSubtitle}>View your saved items</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('PetEvents' as never)}
          >
            <Image source={eventsIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Pet Events</Text>
            <Text style={styles.serviceSubtitle}>See All Pet Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (navigation as any).navigate('Reminders', {})}
          >
            <Image source={clockIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>My Reminders</Text>
            <Text style={styles.serviceSubtitle}>View your reminders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('PetAIChat' as never)}
          >
            <Image source={aiChatIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Furrmaa Pet AI Chat</Text>
            <Text style={styles.serviceSubtitle}>Premium Pet AI Chatbot</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('Cremation' as never)}
          >
            <Image source={cremationIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Cremation</Text>
            <Text style={styles.serviceSubtitle}>Pet Cremation Request</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('Hope' as never)}
          >
            <Image source={hopeIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Hope</Text>
            <Text style={styles.serviceSubtitle}>Lost, Found & Adoption</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => navigation.navigate('HopeChats' as never)}
          >
            <Image source={hopeIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Hope Post & Chats</Text>
            <Text style={styles.serviceSubtitle}>Post & Chat with Pet Lovers</Text>
          </TouchableOpacity>
          
          {WALLET_UI_ENABLED ? (
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => (navigation as any).navigate('Wallet', {})}
            >
              <Image source={accountsIcon} style={styles.serviceIcon} />
              <Text style={styles.serviceTitle}>My Wallet</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (navigation as any).navigate('CreatePost', {})}
          >
            <Image source={eventsIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Upload Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => (navigation as any).navigate('SocialFeed', {})}
          >
            <Image source={aiChatIcon} style={styles.serviceIcon} />
            <Text style={styles.serviceTitle}>Feed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={[styles.sectionCard, { backgroundColor: '#1E3A8A' }]}
          onPress={handleAdminPanel}
        >
          <View style={styles.sectionHeader}>
            <Image source={settingsIcon} style={styles.sectionIcon} />
            <View style={styles.sectionContent}>
              <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Admin Panel</Text>
              <Text style={[styles.sectionSubtitle, { color: '#E5E7EB' }]}>
                Manage Products & Dashboard
              </Text>
            </View>
            <Image source={rightArrow} style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      )}

      {/* Pet Profile Section */}
      <TouchableOpacity
        style={styles.sectionCard}
        onPress={() => (navigation as any).navigate('PetProfile', {})}
      >
        <View style={styles.sectionHeader}>
          <Image source={sectionIcon} style={styles.sectionIcon} />
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Pet Profile</Text>
            <Text style={styles.sectionSubtitle}>See All Pet Profile</Text>
          </View>
          <Image source={rightArrow} style={styles.arrowIcon}/>
        </View>
      </TouchableOpacity>


      {/* Account and Address */}
      <View style={styles.accountSection}>
        <Text style={styles.accountSectionTitle}>Account and Address</Text>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('EditProfile', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={profileIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>My Account</Text>
            <Text style={styles.accountSubtitle}>Manage your account</Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

          <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('AddressManagement', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={addressIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>My Address</Text>
            <Text style={styles.accountSubtitle}>Manage your address</Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('SubscriptionPlan', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={accountsIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>My Subscription Plan</Text>
            <Text style={styles.accountSubtitle}>
              Manage your subscription plan
            </Text>
          </View>
          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>
      </View>

      {/* Notifications and Settings Section */}
      <View style={styles.accountSection}>
        <Text style={styles.accountSectionTitle}>Notifications and Settings</Text>
        
        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('Notifications', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={notificationsIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Notifications</Text>
            <Text style={styles.accountSubtitle}>
              See all your notifications
            </Text>
          </View>
          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('Settings', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={settingsIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Settings</Text>
            <Text style={styles.accountSubtitle}>Manage your app settings</Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.accountSection}>
        <Text style={styles.accountSectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('FAQ', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={faqIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>FAQs</Text>
            <Text style={styles.accountSubtitle}>View all Frequently Asked Questions</Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('MailWithUs', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={chatUsIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Mail With Us</Text>
            <Text style={styles.accountSubtitle}>Send us an email</Text>
          </View>
          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.accountItemCard}
          onPress={() => (navigation as any).navigate('WhatsAppUs', {})}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={chatUsIcon} style={styles.accountIcon} />
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>WhatsApp Us</Text>
            <Text style={styles.accountSubtitle}>Chat with us on WhatsApp</Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => navigation.navigate('ShareFeedback' as never)}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={feedbackIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Share Feedback</Text>
            <Text style={styles.accountSubtitle}>
              Share your feedback to help improve the Furrmaa app
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>
      </View>

      {/* General */}
      <View style={styles.accountSection}>
        <Text style={styles.accountSectionTitle}>General</Text>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => navigation.navigate('AboutUs' as never)}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={aboutUsIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>About us</Text>
            <Text style={styles.accountSubtitle}>
              Learn more about who we are
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => navigation.navigate('Terms' as never)}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={termsIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Terms of Services</Text>
            <Text style={styles.accountSubtitle}>
              Read our Furrmaa Terms of Service
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => navigation.navigate('Privacy' as never)}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={privacyIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Privacy and Policy</Text>
            <Text style={styles.accountSubtitle}>
              Read our Furrmaa Privacy Policy
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => navigation.navigate('RefundReturn' as never)}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={privacyIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Refund & Return Policy</Text>
            <Text style={styles.accountSubtitle}>
              Read our refund and return policy
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity> 
      </View>

      {/* Others Section */}
      <View style={styles.accountSection}>
        <Text style={styles.accountSectionTitle}>Others</Text>

        <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => {
            const url =
              Platform.OS === 'ios'
                ? 'https://apps.apple.com/app/id0000000000'
                : 'https://play.google.com/store/apps/details?id=com.farmaa';
            Linking.openURL(url).catch(() =>
              Alert.alert('Rate us', 'Could not open the app store.')
            );
          }}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={rateUsIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>Rate us on Play Store</Text>
            <Text style={styles.accountSubtitle}>
              Share your valuable feedback on the Play Store
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>
        
      <TouchableOpacity
          style={styles.accountItemCard}
          onPress={() => {
            Alert.alert('Furrmaa', 'You are on the latest version (1.0.0).');
          }}
        >
          <View style={styles.accountIconWrapper}>
            <Image source={versionIcon} style={styles.accountIcon} />
          </View>

          <View style={styles.accountText}>
            <Text style={styles.accountTitle}>App Latest Version</Text>
            <Text style={styles.accountSubtitle}>
              Check the latest version of the app
            </Text>
          </View>

          <Image source={rightArrow} style={styles.accountArrow} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Image source={logoutIcon} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Information Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTopRow}>
          <View style={styles.footerBrand}>
            <View style={styles.appLogo}>
              <Image source={logo} style={styles.logoEmoji} />
            </View>

            <View>
              <Text style={styles.appName}>FURRMAA</Text>
              <Text style={styles.appTagline}>
                WHERE EVERY TAIL FEELS AT HOME
              </Text>
            </View>
          </View>

          <Text style={styles.appVersion}>App Version 1.0.0</Text>
        </View>
        <Text style={styles.footerText}>
          Made With Gentle Care in Jaipur, India
        </Text>
        <Text style={styles.footerSlogan}>
          Because Your Pet{'\n'}Deserves the Very Best 🐾
        </Text>
        <View style={styles.footerBottomRow}>
          
          <Text style={styles.craftedText}>
            <Image source={kontentKraftIcon} style={{width:16, height:16, marginRight:10}} />
            Crafted by <Text style={styles.craftedBold}>Kontent Kraft Digital</Text>
          </Text>

          <Text style={styles.visitText}>Visit →</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  topSection: {
    backgroundColor: '#C0DBFF',
    marginTop: 15,
    paddingVertical: 12,
    marginHorizontal:20,
    borderRadius:14,
    elevation:4,
  },
  badge: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
  },
  profileIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileIcon: {
    width: 24,
    height: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileAction: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickLinksCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickLinkItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickLinkIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  sectionCard: {
    backgroundColor: '#F3F8FF',
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 0.5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  serviceIcon: {
    width: 24,
    height: 24,
    marginBottom: 10,
  },
serviceTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111827',
  marginBottom: 4,
},

serviceSubtitle: {
  fontSize: 12,
  color: '#6B7280',
  lineHeight: 16,
},
accountSection: {
  marginTop: 20,
  backgroundColor: '#F9FAFB',
},

accountSectionTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#000000',
  paddingHorizontal: 20,
  paddingVertical: -10,
  marginBottom: 10,
},

accountItemCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  marginHorizontal: 16,
  marginBottom: 12,
  shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 0.5,
  },

  accountIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  accountIcon: {
   width: 24,
    height: 24,
  },

  accountText: {
    flex: 1,
  },

  accountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  accountSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  accountArrow: {
    width: 24,
    height: 24,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    marginRight: 15,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  arrowIcon: {
    width:30,
    height:30,
  },

  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  serviceContent: {
    flex: 1,
  },
  footer: {
  padding: 18,
  backgroundColor: '#F9FAFB',
},

footerTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 24,
},

footerBrand: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},

appLogo: {
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: 'center',
  alignItems: 'center',
},

logoEmoji: {
  width: '100%',
  height: '100%',
},

appName: {
  fontSize: 16,
  fontWeight: '700',
  color: '#6B7280',
},

appTagline: {
  fontSize: 10,
  letterSpacing: 0.6,
  color: '#9CA3AF',
},

appVersion: {
  fontSize: 12,
  color: '#9CA3AF',
},

footerText: {
  fontSize: 12,
  color: '#9CA3AF',
  marginBottom: 24,
},

footerSlogan: {
  fontSize: 28,
  fontWeight: '600',
  color: '#9CA3AF',
  lineHeight: 36,
  marginBottom: 32,
},

footerBottomRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

craftedText: {
  fontSize: 12,
  color: '#9CA3AF',
},

craftedBold: {
  fontWeight: '600',
  color: '#6B7280',
},

visitText: {
  fontSize: 12,
  color: '#6B7280',
},
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default ProfileScreen;
