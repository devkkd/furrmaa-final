import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { ONBOARDING_COMPLETE_KEY } from '../services/auth0Session';

// @ts-ignore
import logoImage from '../assets/images/Logo.png';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after splash — wait for auth bootstrap
    const timer = setTimeout(async () => {
      if (loading) return;

      if (isAuthenticated) {
        // @ts-ignore
        navigation.replace('MainTabs');
        return;
      }

      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (onboardingDone === '1') {
        // @ts-ignore
        navigation.replace('MobileLogin');
      } else {
        // @ts-ignore
        navigation.replace('Onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, navigation, isAuthenticated, loading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Logo Image */}
        <View style={styles.logoContainer}>
          <View style={styles.logoClip}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* App Name */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.appName}>FURRMAA</Text>
          <Text style={styles.tagline}>WHERE EVERY TAIL FEELS AT HOME</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoClip: {
    width: 112,
    height: 112,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 128,
    height: 128,
    marginLeft: -8,
    marginTop: -8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1F2937', // Dark gray
    marginBottom: 10,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280', // Gray
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
