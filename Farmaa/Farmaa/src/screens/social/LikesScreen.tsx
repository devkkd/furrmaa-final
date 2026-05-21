import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import profilePic from '../../assets/images/feedProfImage.png';
import leftArrow from '../../assets/images/arrow-left.png';
import api from '../../config/api';

const LikesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params as any;
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!postId);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await api.CLIENT.get(api.ENDPOINTS.SOCIAL);
        const post = (res.data?.posts || []).find((p: any) => p._id === postId);
        const likeUsers = post?.likes || [];
        setLikes(
          likeUsers.map((u: any, i: number) => ({
            id: u._id || String(i),
            name: u.name || 'User',
            profileImage: u.profileImage ? { uri: u.profileImage } : profilePic,
          }))
        );
      } catch {
        setLikes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const renderLikeItem = ({ item }: { item: any }) => (
    <View style={styles.likeItem}>
      <View style={styles.profileImage}>
        <Image source={item.profileImage} style={styles.profileEmoji} />
      </View>
      <View style={styles.likeInfo}>
        <Text style={styles.petName}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Likes ({likes.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1F2E46" style={{ marginTop: 40 }} />
      ) : likes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Likes Yet</Text>
          <Text style={styles.emptySubtitle}>Be the first to like this post!</Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.id}
          renderItem={renderLikeItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backIcon: { width: 28, height: 28, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  listContent: { padding: 16 },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImage: { marginRight: 12 },
  profileEmoji: { width: 48, height: 48, borderRadius: 24 },
  likeInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default LikesScreen;
