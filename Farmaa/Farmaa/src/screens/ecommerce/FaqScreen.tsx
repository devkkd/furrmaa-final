import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import downArrow from '../../assets/images/arrow-right.png';
import rightArrow from '../../assets/images/arrow-right1.png';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    id: '1',
    question: 'What is Furrmaa?',
    answer:
      'Furrmaa is a mobile app that connects pet owners with a variety of pet-related services – from vet clinics to adoption, events, chat support, pet creation requests, and more.',
  },
  {
    id: '2',
    question: 'Do I need an account to use Furrmaa?',
    answer:
      'Yes, to manage pet profiles, request services, and use personalized features, you need to create an account.',
  },
  {
    id: '3',
    question: 'What kind of services can I find on Furrmaa?',
    answer:
      'You can access veterinary clinics, adoption and lost & found services, pet events, creation requests, pet-profile management, and a premium AI chatbot.',
  },
  {
    id: '4',
    question: 'How does location-based search work?',
    answer:
      'With your permission, Furrmaa uses your current location to show nearby veterinary clinics and services – helping you find help quickly when needed.',
  },
  {
    id: '5',
    question: 'Is my personal and pet information safe?',
    answer:
      'Yes. We follow industry-standard security practices, do not sell your data, and only share it with trusted partners when necessary.',
  },
  {
    id: '6',
    question: 'Can I delete my account and my data?',
    answer:
      'Yes, you can request account deletion at any time. We will remove your personal data in accordance with our Privacy Policy.',
  },
  {
    id: '7',
    question: 'Are there any charges or fees?',
    answer:
      'Furrmaa itself is free to download and use. Some services (e.g. vet visits or premium chatbot features) may incur charges from third-party providers.',
  },
  {
    id: '8',
    question: 'How do I contact support?',
    answer:
      'Use the “Chat With Us” feature in the app to raise any concerns, feedback, or support requests.',
  },
  {
    id: '9',
    question: 'Can I trust the listings on Furrmaa?',
    answer:
      'We aim to partner only with verified and reputable service providers. However, users are encouraged to review provider credentials as needed.',
  },
];

const FAQsScreen = () => {
  const navigation = useNavigation();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backArrow} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ's</Text>
      </View>

      {/* FAQ List */}
      {faqs.map((item) => {
        const isOpen = openId === item.id;
        return (
          <View key={item.id} style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.questionRow}
              onPress={() => toggle(item.id)}
            >
              <Text style={styles.question}>{item.question}</Text>
              {isOpen ? (
              <Image source={downArrow} style={styles.chevron} />
            ) : (
              <Image source={rightArrow} style={styles.chevron} />
            )}
            </TouchableOpacity>

            {isOpen && (
              <Text style={styles.answer}>{item.answer}</Text>
            )}
          </View>
        );
      })}
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
    height: 30,
    width: 30,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  chevron: {
    height: 20,
    width: 20,
  },

  answer: {
    marginTop: 10,
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
});

export default FAQsScreen;