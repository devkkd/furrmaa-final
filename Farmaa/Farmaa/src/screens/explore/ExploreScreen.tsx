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

const CATEGORY_SCREEN: Record<string, string> = {
  training: 'Training',
  adoption: 'Adoption',
  health: 'Healthcare',
  care: 'Healthcare',
  nutrition: 'Products',
  grooming: 'ServiceProviders',
  behavior: 'Training',
  general: 'Products',
};

const ExploreScreen = () => {
  const navigation = useNavigation();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const navigateTo = (screenName: string, params: any = {}) => {
    try {
      const parentNav = navigation.getParent();
      if (parentNav) {
        (parentNav as any).navigate(screenName, params);
      } else {
        (navigation as any).navigate(screenName, params);
      }
    } catch {
      (navigation as any).navigate(screenName, params);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.CLIENT.get(api.ENDPOINTS.EXPLORE, {
          params: { featured: 'true' },
        });
        setFeatured(res.data?.content || []);
      } catch {
        setFeatured([]);
      } finally {
        setLoadingFeatured(false);
      }
    })();
  }, []);

  const exploreCategories = [
    { id: 1, name: 'Training', icon: '🎓', screen: 'Training' },
    { id: 2, name: 'Adoption', icon: '🐾', screen: 'Adoption' },
    { id: 3, name: 'Healthcare', icon: '🏥', screen: 'Healthcare' },
    { id: 4, name: 'Services', icon: '📅', screen: 'ServiceProviders' },
    { id: 5, name: 'Emergency', icon: '🚨', screen: 'Emergency' },
    { id: 6, name: 'Hotels', icon: '🏨', screen: 'ServiceProviders' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover amazing services for your pet</Text>
      </View>

      <View style={styles.categoriesContainer}>
        {exploreCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigateTo(category.screen, {})}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {(loadingFeatured || featured.length > 0) && (
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Featured</Text>
          {loadingFeatured ? (
            <ActivityIndicator color="#1E3A8A" style={{ marginVertical: 16 }} />
          ) : (
            featured.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.featuredCard}
                onPress={() => {
                  const screen = CATEGORY_SCREEN[item.category] || 'Products';
                  navigateTo(screen, {});
                }}
              >
                <Text style={styles.featuredCardTitle}>{item.title}</Text>
                <Text style={styles.featuredCardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#FFFFFF', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  headerSubtitle: { fontSize: 16, color: '#666' },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIcon: { fontSize: 48, marginBottom: 10 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#333' },
  featuredSection: { paddingHorizontal: 15, paddingBottom: 24 },
  featuredTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  featuredCardTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 6 },
  featuredCardDesc: { fontSize: 14, color: '#666' },
});

export default ExploreScreen;
