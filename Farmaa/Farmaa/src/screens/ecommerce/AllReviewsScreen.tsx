import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import leftArrow from '../../assets/images/arrow-left.png';
import api from '../../config/api';

type ReviewItem = {
  id: string;
  rating: number;
  text: string;
  author: string;
};

const AllReviewsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as any) || {};
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [rating, setRating] = useState(params.rating || 0);
  const [reviewCount, setReviewCount] = useState(params.reviewCount || 0);
  const [loading, setLoading] = useState(!params.reviews);

  useEffect(() => {
    const mapReviews = (list: any[]) =>
      (list || []).map((r: any, i: number) => ({
        id: r._id || String(i),
        rating: r.rating || 5,
        text: r.comment || r.text || '',
        author: r.user?.name ? `${r.user.name}` : 'Customer',
      }));

    if (params.reviews && Array.isArray(params.reviews)) {
      setReviews(mapReviews(params.reviews));
      setLoading(false);
      return;
    }

    const productId = params.productId;
    if (!productId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.CLIENT.get(`${api.ENDPOINTS.PRODUCTS}/${productId}`);
        const p = res.data?.product;
        if (p) {
          setRating(p.rating || 0);
          setReviewCount(Array.isArray(p.reviews) ? p.reviews.length : p.reviews || 0);
          setReviews(mapReviews(p.reviews));
        }
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.productId, params.reviews]);

  return (
    <ScrollView style={styles.allReviewsContainer}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate and Reviews</Text>
      </View>

      <View style={styles.ratingRow}>
        <Text style={styles.hearderStars}>
          {'★'.repeat(Math.round(Number(rating) || 0))}
          {'☆'.repeat(5 - Math.round(Number(rating) || 0))}
        </Text>
        <Text style={styles.ratingText}>
          {rating} | {reviewCount}
        </Text>
      </View>

      {params.productName ? (
        <Text style={styles.productName}>{params.productName}</Text>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#1F2E46" style={{ marginTop: 40 }} />
      ) : reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet for this product.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <Text style={styles.stars}>{'★'.repeat(review.rating)}</Text>
            <Text style={styles.reviewText}>{review.text}</Text>
            <Text style={styles.author}>{review.author}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  allReviewsContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 40 },
  backIcon: { width: 28, height: 28, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hearderStars: { fontSize: 18, color: '#F59E0B', marginRight: 8 },
  ratingText: { fontSize: 14, color: '#6B7280' },
  productName: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 32 },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },
  stars: { color: '#F59E0B', marginBottom: 8 },
  reviewText: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 8 },
  author: { fontSize: 12, color: '#9CA3AF' },
});

export default AllReviewsScreen;
