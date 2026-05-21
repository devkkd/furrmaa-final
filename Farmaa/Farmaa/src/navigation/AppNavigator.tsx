import React, { useEffect } from 'react';
import { Text, BackHandler, Alert, Image, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef, resetToLoginScreen } from './navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MobileLoginScreen from '../screens/auth/MobileLoginScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import EmailLoginScreen from '../screens/auth/EmailLoginScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProductsScreen from '../screens/ecommerce/ProductsScreen';
import ProductDetailScreen from '../screens/ecommerce/ProductDetailScreen';
import SearchScreen from '../screens/ecommerce/SearchScreen';
import FilterScreen from '../screens/ecommerce/FilterScreen';
import CartScreen from '../screens/ecommerce/CartScreen';
import AddressScreen from '../screens/ecommerce/AddressScreen';
import PaymentSuccessScreen from '../screens/ecommerce/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/ecommerce/PaymentFailedScreen';
import OrderDetailScreen from '../screens/ecommerce/OrderDetailScreen';
import OrderUpdateScreen from '../screens/ecommerce/OrderUpdateScreen';
import ReturnOrderScreen from '../screens/ecommerce/ReturnOrderScreen';
import CheckoutScreen from '../screens/ecommerce/CheckoutScreen';
import AllReviewsScreen from '../screens/ecommerce/AllReviewsScreen'
import EcommerceAddAddressScreen from '../screens/ecommerce/AddAddressScreen';

// Service Screens
import ServicesScreen from '../screens/services/ServicesScreen';
import ServiceProvidersScreen from '../screens/services/ServiceProvidersScreen';
import BookingScreen from '../screens/services/BookingScreen';
import MyBookingsScreen from '../screens/services/MyBookingsScreen';
import ShareFeedbackScreen from '../screens/ecommerce/ShareFeedbackScreen';

// Healthcare Screens
import HealthcareScreen from '../screens/healthcare/HealthcareScreen';
import PetHealthScreen from '../screens/healthcare/PetHealthScreen';
import VeterinariansScreen from '../screens/healthcare/VeterinariansScreen';
import VetSearchScreen from '../screens/healthcare/VetSearchScreen';
import ChangeLocationScreen from '../screens/healthcare/ChangeLocationScreen';

// Training Screens
import TrainingScreen from '../screens/training/TrainingScreen';
import TrainingProgramsScreen from '../screens/training/TrainingProgramsScreen';
import TrainingLessonsScreen from '../screens/training/TrainingLessonsScreen';
import VideoPlayerScreen from '../screens/training/VideoPlayerScreen';
import SubscriptionScreen from '../screens/training/SubscriptionScreen';

// Adoption Screens
import AdoptionScreen from '../screens/adoption/AdoptionScreen';
import PetDetailScreen from '../screens/adoption/PetDetailScreen';
import AdoptionFormScreen from '../screens/adoption/AdoptionFormScreen';

// Social Screens
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import CreatePostScreen from '../screens/social/CreatePostScreen';
import CommentsScreen from '../screens/social/CommentsScreen';
import CameraScreen from '../screens/social/CameraScreen';
import PostVideoScreen from '../screens/social/PostVideoScreen';
import ViewVideoScreen from '../screens/social/ViewVideoScreen';
import LikesScreen from '../screens/social/LikesScreen';

// Explore Screen
import ExploreScreen from '../screens/explore/ExploreScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyPetsScreen from '../screens/profile/MyPetsScreen';
import AddPetScreen from '../screens/profile/AddPetScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import PetProfileScreen from '../screens/profile/PetProfileScreen';
import EditPetProfileScreen from '../screens/profile/EditPetProfileScreen';
import AddPetProfileScreen from '../screens/profile/AddPetProfileScreen';
import AddressManagementScreen from '../screens/profile/AddressManagementScreen';
import AddAddressScreen from '../screens/profile/AddAddressScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import FAQScreen from '../screens/profile/FAQScreen';
import FeedbackScreen from '../screens/profile/FeedbackScreen';
import SupportChatScreen from '../screens/profile/SupportChatScreen';
import SubscriptionPlanScreen from '../screens/profile/SubscriptionScreen';
import AboutUsScreen from '../screens/profile/AboutUsScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import WishlistScreen from '../screens/profile/WishlistScreen';
import RemindersScreen from '../screens/profile/RemindersScreen';
import AddReminderScreen from '../screens/profile/AddReminderScreen';
import WalletScreen from '../screens/profile/WalletScreen';
import RechargeWalletScreen from '../screens/profile/RechargeWalletScreen';
import WithdrawWalletScreen from '../screens/profile/WithdrawWalletScreen';
import MailWithUsScreen from '../screens/profile/MailWithUsScreen';
import WhatsAppUsScreen from '../screens/profile/WhatsAppUsScreen';
import RefundReturnScreen from '../screens/profile/RefundReturnScreen';

// AI Chat Screens
import PetAIChatScreen from '../screens/ai/PetAIChatScreen';
import ChatHistoryScreen from '../screens/ai/ChatHistoryScreen';

// Hope Screens
import HopeScreen from '../screens/hope/HopeScreen';
import HopeDetailScreen from '../screens/hope/HopeDetailScreen';
import AddHopePostScreen from '../screens/hope/AddHopePostScreen';
import HopeChatsListScreen from '../screens/hope/HopeChatsListScreen';
import HopeChatScreen from '../screens/hope/HopeChatScreen';
import HopeChangeLocationScreen from '../screens/hope/HopeChangeLocationScreen';

// Pet Events Screens
import PetEventsScreen from '../screens/events/PetEventsScreen';
import PetEventDetailScreen from '../screens/events/PetEventDetailScreen';
import PetEventsChangeLocationScreen from '../screens/events/PetEventsChangeLocationScreen';

// Cremation Screens
import CremationScreen from '../screens/cremation/CremationScreen';
import CremationRequestScreen from '../screens/cremation/CremationRequestScreen';
import CremationChangeLocationScreen from '../screens/cremation/CremationChangeLocationScreen';

// Emergency Screen
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
// Icons
import shoppingBagIcon from '../assets/images/bag-2.png';
import exploreIcon from '../assets/images/search-normal.png';
import trainIcon from '../assets/images/pet.png';
import feedIcon from '../assets/images/video-square.png';
import vetIcon from '../assets/images/Group 16.png';
import moreIcon from '../assets/images/category-2.png';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminVeterinariansScreen from '../screens/admin/AdminVeterinariansScreen';
import AdminVetServiceTypesScreen from '../screens/admin/AdminVetServiceTypesScreen';
import AdminPostsScreen from '../screens/admin/AdminPostsScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';
import ProductFormScreen from '../screens/admin/ProductFormScreen';
import AdminFAQScreen from '../screens/admin/AdminFAQScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminSupportScreen from '../screens/admin/AdminSupportScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminTrainingVideosScreen from '../screens/admin/AdminTrainingVideosScreen';
import AdminPetEventsScreen from '../screens/admin/AdminPetEventsScreen';
import AdminHopePostsScreen from '../screens/admin/AdminHopePostsScreen';
import AdminCremationCentersScreen from '../screens/admin/AdminCremationCentersScreen';
import AdminExploreContentScreen from '../screens/admin/AdminExploreContentScreen';
import AdminWalletsScreen from '../screens/admin/AdminWalletsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#1E293B',
        tabBarInactiveTintColor: '#1E293B',
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom - 10, 0),
          backgroundColor: '#F1F5F9',
          margin:10,
          borderTopWidth: 0, 
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
          padding:5,

        },

      }}
    >
      <Tab.Screen 
        name="ProductsTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="shopping-bag"
              size={30}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="TrainTab" 
        component={TrainingScreen}
        options={{
          tabBarLabel: 'Train',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="train"
              size={30}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="SocialTab" 
        component={SocialFeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="feed"
              size={30}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="VetTab" 
        component={VeterinariansScreen}
        options={{
          tabBarLabel: 'Vet',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="vet"
              size={30}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="more"
              size={30}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component - using emoji for now
const Icon = ({
  name,
  size,
  color,
  focused,
}: {
  name: string;
  size: number;
  color: string;
  focused: boolean;
}) => {
  const iconMap: { [key: string]: any } = {
    'shopping-bag': shoppingBagIcon,
    train: trainIcon,
    feed: feedIcon,
    vet: vetIcon,
    more: moreIcon,
  };

  const source = iconMap[name];
  if (!source) return null;

  return (
    <View
      style={{
        backgroundColor: focused ? '#1E293B' : 'transparent',
        paddingHorizontal: 22,
        paddingVertical: 8,
        borderRadius: 30,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        source={source}
        resizeMode="contain"
        style={{
          width: size,
          height: size,
          tintColor: focused ? '#FFFFFF' : '#1F2E46',
        }}
      />
    </View>
  );
};


const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Authentication enabled - show onboarding and login screens
  const SKIP_AUTH = false; // Set to true to skip authentication

  const AUTH_ROUTE_NAMES = new Set([
    'Onboarding',
    'Login',
    'MobileLogin',
    'EmailLogin',
    'OTPVerification',
    'Register',
  ]);

  // After login/register/OTP — auth stack se home par le jao
  useEffect(() => {
    if (loading || !isAuthenticated || !navigationRef.isReady()) return;

    const rootState = navigationRef.getRootState();
    const routeName = rootState?.routes?.[rootState.index]?.name;
    if (routeName && AUTH_ROUTE_NAMES.has(routeName)) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  }, [isAuthenticated, loading, navigationRef]);

  // Logout / expired session — home se login screen
  useEffect(() => {
    if (loading || isAuthenticated || !navigationRef.isReady()) return;

    const routeName = navigationRef.getRootState()?.routes?.[navigationRef.getRootState().index]?.name;
    if (routeName === 'MainTabs') {
      resetToLoginScreen();
    }
  }, [isAuthenticated, loading]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Check if navigation can go back
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true; // Prevent default behavior (app close)
      }
      // If on root screen, show exit confirmation
      Alert.alert(
        'Exit App',
        'Do you want to exit the app?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ]
      );
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={SKIP_AUTH ? "MainTabs" : "Splash"}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* MainTabs always available - onboarding can navigate to it */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        
        {/* Auth screens — hamesha register rakho; warna logout ke baad RESET(MobileLogin) pe route milta hi nahi aur ErrorBoundary crash */}
        {!SKIP_AUTH && (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MobileLogin" component={MobileLoginScreen} />
            <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        
        {/* ALL STACK SCREENS - Always registered so Tab Navigator can navigate to them */}
        <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Filter" component={FilterScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="OrderUpdate" component={OrderUpdateScreen} />
            <Stack.Screen name="ReturnOrder" component={ReturnOrderScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="ServiceProviders" component={ServiceProvidersScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="PetHealth" component={PetHealthScreen} />
            <Stack.Screen name="Veterinarians" component={VeterinariansScreen} />
            <Stack.Screen name="VetSearch" component={VetSearchScreen} />
            <Stack.Screen name="ChangeLocation" component={ChangeLocationScreen} />
            <Stack.Screen name="TrainingPrograms" component={TrainingProgramsScreen} />
            <Stack.Screen name="TrainingLessons" component={TrainingLessonsScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} />
            <Stack.Screen name="AdoptionForm" component={AdoptionFormScreen} />
            <Stack.Screen name="SocialFeed" component={SocialFeedScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="Comments" component={CommentsScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="PostVideo" component={PostVideoScreen} />
            <Stack.Screen name="ViewVideo" component={ViewVideoScreen} />
            <Stack.Screen name="Likes" component={LikesScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyPets" component={MyPetsScreen} />
            <Stack.Screen name="AddPet" component={AddPetScreen} />
            <Stack.Screen name="PetProfile" component={PetProfileScreen} />
            <Stack.Screen name="EditPetProfile" component={EditPetProfileScreen} />
            <Stack.Screen name="AddPetProfile" component={AddPetProfileScreen} />
            <Stack.Screen name="AddressManagement" component={AddressManagementScreen} />
            <Stack.Screen name="AddAddress" component={AddAddressScreen} />
            <Stack.Screen name="EditAddress" component={AddAddressScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="SupportChat" component={SupportChatScreen} />
            <Stack.Screen name="SubscriptionPlan" component={SubscriptionPlanScreen} />
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="AddReminder" component={AddReminderScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="RechargeWallet" component={RechargeWalletScreen} />
            <Stack.Screen name="WithdrawWallet" component={WithdrawWalletScreen} />
            <Stack.Screen name="MailWithUs" component={MailWithUsScreen} />
            <Stack.Screen name="WhatsAppUs" component={WhatsAppUsScreen} />
            <Stack.Screen name="RefundReturn" component={RefundReturnScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Healthcare" component={HealthcareScreen} />
            <Stack.Screen name="Training" component={TrainingScreen} />
            <Stack.Screen name="Adoption" component={AdoptionScreen} />
            <Stack.Screen name="PetAIChat" component={PetAIChatScreen} />
            <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
            <Stack.Screen name="Hope" component={HopeScreen} />
            <Stack.Screen name="HopeDetail" component={HopeDetailScreen} />
            <Stack.Screen name="AddHopePost" component={AddHopePostScreen} />
            <Stack.Screen name="HopeChats" component={HopeChatsListScreen} />
            <Stack.Screen name="HopeChat" component={HopeChatScreen} />
            <Stack.Screen name="HopeChangeLocation" component={HopeChangeLocationScreen} />
            <Stack.Screen name="PetEvents" component={PetEventsScreen} />
            <Stack.Screen name="PetEventDetail" component={PetEventDetailScreen} />
            <Stack.Screen name="PetEventsChangeLocation" component={PetEventsChangeLocationScreen} />
            <Stack.Screen name="Cremation" component={CremationScreen} />
            <Stack.Screen name="CremationRequest" component={CremationRequestScreen} />
            <Stack.Screen name="CremationChangeLocation" component={CremationChangeLocationScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminProducts" component={AdminProductsScreen} />
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
            <Stack.Screen name="AdminVeterinarians" component={AdminVeterinariansScreen} />
            <Stack.Screen name="AdminVetServiceTypes" component={AdminVetServiceTypesScreen} />
            <Stack.Screen name="AdminPosts" component={AdminPostsScreen} />
            <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} />
            <Stack.Screen name="ProductForm" component={ProductFormScreen} />
            <Stack.Screen name="AdminFAQ" component={AdminFAQScreen} />
            <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
            <Stack.Screen name="AdminSupport" component={AdminSupportScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
            <Stack.Screen name="AdminTrainingVideos" component={AdminTrainingVideosScreen} />
            <Stack.Screen name="AdminPetEvents" component={AdminPetEventsScreen} />
            <Stack.Screen name="AdminHopePosts" component={AdminHopePostsScreen} />
            <Stack.Screen name="AdminCremationCenters" component={AdminCremationCentersScreen} />
            <Stack.Screen name="AdminExploreContent" component={AdminExploreContentScreen} />
            <Stack.Screen name="AdminWallets" component={AdminWalletsScreen} />
            <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
            <Stack.Screen name="AllReviews" component={AllReviewsScreen} />
            <Stack.Screen name="EcommerceAddAddress" component={EcommerceAddAddressScreen} />
            <Stack.Screen name='ShareFeedback' component={ShareFeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

