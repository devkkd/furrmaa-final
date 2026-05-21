import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQScreen = () => {
  const navigation = useNavigation();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'General', value: 'general' },
    { label: 'Orders', value: 'orders' },
    { label: 'Products', value: 'products' },
    { label: 'Services', value: 'services' },
    { label: 'Account', value: 'account' },
    { label: 'Payment', value: 'payment' },
  ];

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const endpoint = selectedCategory === 'all' 
        ? api.ENDPOINTS.FAQ 
        : `${api.ENDPOINTS.FAQ_CATEGORY}/${selectedCategory}`;
      const response = await api.CLIENT.get(endpoint);
      if (response.data?.success && response.data?.faqs) {
        setFaqs(response.data.faqs);
      } else {
        setFaqs([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch FAQs:', error);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading FAQs...</Text>
      </View>
    );
  }

  const displayFAQs = faqs;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {displayFAQs.length === 0 && !loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No FAQs found</Text>
          </View>
        ) : (
          displayFAQs.map((faq) => (
          <TouchableOpacity
            key={faq._id}
            style={styles.faqCard}
            onPress={() => toggleFAQ(faq._id)}
          >
            <View style={styles.faqContent}>
              <View style={styles.faqTextContainer}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expandedId === faq._id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
              <Text style={styles.chevronIcon}>
                {expandedId === faq._id ? '⌄' : '›'}
              </Text>
            </View>
          </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
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
  content: {
    flex: 1,
    padding: 15,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 16,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  chevronIcon: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
});

export default FAQScreen;



