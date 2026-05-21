import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_COMPLETE_KEY } from '../../services/auth0Session';

const { width } = Dimensions.get('window');

// Import images
// @ts-ignore
import splash1 from '../../assets/images/pet 1.png';
// @ts-ignore
import splash2 from '../../assets/images/Group 9.png';
// @ts-ignore
import splash3 from '../../assets/images/Group 151.png';
// @ts-ignore
import splash4 from '../../assets/images/Group 15.png';
// @ts-ignore
import splash5 from '../../assets/images/Group 12.png';
// @ts-ignore
import splash6 from '../../assets/images/Group 11.png';
// @ts-ignore
import logoImage from '../../assets/images/Logo.png';

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Everything Your Pet Loves, Delivered',
      description: 'Premium food, meds, toys & essentials - curated with care for your furry family',
      image: splash1,
      color: '#FFFFFF',
      emojis: '🐾✨',
    },
    {
      id: 2,
      title: 'Train Smarter. Bond Better',
      description: 'Expert-led videos that help your pet grow, behave, and thrive - one lesson at a time.',
      image: splash2,
      color: '#FFFFFF',
      emojis: '🖱️📹🐕',
    },
    {
      id: 3,
      title: 'Unleash the Fun - Pet Reels & Trending Moments!',
      description: 'Watch adorable pet reels, share your pet\'s cutest moments, and join a community full of wagging tails & happy purrs.',
      image: splash3,
      color: '#FFFFFF',
      emojis: '🐾✨',
    },
    {
      id: 4,
      title: 'Your Vet, Just a Tap Away',
      description: 'Instant consultations, appointments, and health tracking to keep your pet safe and healthy.',
      image: splash4,
      color: '#FFFFFF',
      emojis: '👨‍⚕️📱',
    },
    {
      id: 5,
      title: 'Find Love, Find Home, Find Hope',
      description: 'Adopt a pet, reunite the lost, and join a community built on compassion and care.',
      image: splash5,
      color: '#FFFFFF',
      emojis: '❤️🌿',
      extraEmojis: '✨🐾',
    },
    {
      id: 6,
      title: 'Safe Stays for Happy Pets',
      description: 'Find trusted hotels, hostels & NGOs for boarding, care, or shelter—anytime you need it.',
      image: splash6,
      color: '#FFFFFF',
      emojis: '🐕🐱🐾',
      extraEmojis: '💛👆',
    },
  ];

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(slideIndex);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, '1');
    (navigation as any).replace('MobileLogin');
  };

  const goToNext = () => {
    if (currentPage < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentPage + 1) * width,
        animated: true,
      });
    } else {
      finishOnboarding();
    }
  };

  const skip = () => {
    finishOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo and Skip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogo}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerAppName}>FURRMAA</Text>
            <Text style={styles.headerTagline}>WHERE EVERY TAIL FEELS AT HOME</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { backgroundColor: slide.color }]}>
            {/* Main Image */}
            <View style={styles.imageContainer}>
              <Image 
                source={slide.image} 
                style={styles.slideImage}
                resizeMode="contain"
              />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>
                {slide.title}
                {slide.emojis && <Text> {slide.emojis}</Text>}
              </Text>
              <Text style={styles.description}>
                {slide.description}
                {slide.extraEmojis && <Text> {slide.extraEmojis}</Text>}
              </Text>
              {slide.id === 2 && (
                <Text style={styles.descriptionEmoji}>🐾❤️</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer with Pagination and Next Button */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentPage === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === slides.length - 1 ? 'Let\'s Start →' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    marginRight: 12,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoInner: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  animalHead: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  dogHead: {
    backgroundColor: '#1E40AF',
    left: 4,
    top: 8,
  },
  catHead: {
    backgroundColor: '#10B981',
    right: 4,
    top: 8,
  },
  headerText: {
    flex: 1,
  },
  headerAppName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerTagline: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '300',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: 40,
    minHeight: 150,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 10,
  },
  descriptionEmoji: {
    fontSize: 16,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#1F2937',
  },
  nextButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
