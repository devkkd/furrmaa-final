import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import bgImage from '../../assets/images/feedBg.png';
import deleteIcon from '../../assets/images/trash-2.png';
import likeIcon2 from '../../assets/images/like-icon-2.png';
import likeIcon from '../../assets/images/like-icon.png';
import shareIcon from '../../assets/images/send-2.png';
import actionIcon from '../../assets/images/more.png';
import commentIcon from '../../assets/images/Group 173.png';
import profilePic from '../../assets/images/feedProfImage.png';

const { width, height } = Dimensions.get('window');

const ViewVideoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params as { postId?: string };
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);

  const userId = user?.id || (user as any)?._id;

  const loadPost = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.CLIENT.get(api.ENDPOINTS.SOCIAL);
      const found = (res.data?.posts || []).find((p: any) => p._id === postId);
      setPost(found || null);
      if (found && userId) {
        const likesList = found.likes || [];
        const liked = likesList.some(
          (l: any) => (l?._id || l)?.toString() === userId.toString()
        );
        setIsLiked(liked);
      }
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, userId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const likesCount = Array.isArray(post?.likes) ? post.likes.length : 0;
  const commentsCount = Array.isArray(post?.comments) ? post.comments.length : 0;
  const petName = post?.pet?.name || post?.user?.name || 'Pet';
  const profileImage = post?.user?.profileImage
    ? { uri: post.user.profileImage }
    : profilePic;
  const mediaUri =
    post?.videos?.[0] || post?.images?.[0] || null;
  const isOwner =
    userId && post?.user?._id && post.user._id.toString() === userId.toString();

  const handleLike = async () => {
    if (!postId || !user) return;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    try {
      const res = await api.CLIENT.put(api.ENDPOINTS.SOCIAL_LIKE.replace(':id', postId));
      if (res.data?.post) setPost(res.data.post);
    } catch {
      setIsLiked(wasLiked);
      Alert.alert('Error', 'Could not update like');
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    Alert.alert(
      'Not available',
      'Deleting posts from the app is not supported yet. Contact support if you need a post removed.'
    );
  };

  const handleComment = () => {
    if (!postId) return;
    (navigation as any).navigate('Comments' as never, { postId } as never);
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      const name = post.user?.name || 'Someone';
      const content = (post.content || '').trim().slice(0, 100);
      const message = content
        ? `${name} on Furrmaa: ${content}`
        : `${name} shared a post on Furrmaa.`;
      await Share.share({ message, title: 'Furrmaa' });
    } catch {
      /* user cancelled */
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.videoContainer}>
        <View style={styles.videoPlayer}>
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.videoPlaceholder} />
          ) : (
            <Image source={bgImage} style={styles.videoPlaceholder} />
          )}
        </View>

        {isOwner ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Image source={deleteIcon} style={styles.deleteIcon} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.actionSidebar}>
          <View style={styles.actionButton}>
            <TouchableOpacity onPress={handleLike}>
              {isLiked ? (
                <Image source={likeIcon2} style={styles.actionIcon} />
              ) : (
                <Image source={likeIcon} style={styles.actionIcon} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                (navigation as any).navigate('Likes' as never, { postId } as never)
              }
            >
              <Text style={styles.actionCount}>{likesCount}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Image source={commentIcon} style={styles.actionIcon} />
            <Text style={styles.actionCount}>{commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Image source={shareIcon} style={styles.actionIcon} />
            <Text style={styles.actionCount}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={actionIcon} style={styles.actionIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.postDetails}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <Image source={profileImage} style={styles.profileEmoji} />
            </View>
            <View style={styles.postInfo}>
              <Text style={styles.petName}>{petName}</Text>
              <Text style={styles.postDescription}>{post.content || ''}</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteWrapper}>
                <Image source={deleteIcon} style={styles.deleteModalIcon} />
              </View>
              <TouchableOpacity
                style={styles.closeIconWrapper}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.closeModalIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteModalTitle}>Delete Video</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this post?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>Yes, Delete</Text>
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
    backgroundColor: '#000000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { color: '#FFF', fontSize: 16, marginBottom: 12 },
  backLink: { color: '#FF6B6B', fontSize: 16 },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  actionSidebar: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  postDetails: {
    position: 'absolute',
    bottom: 30,
    left: 15,
    right: 80,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
  },
  profileEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInfo: {
    flex: 1,
  },
  petName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  postDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deleteWrapper: {},
  deleteModalIcon: { width: 32, height: 32 },
  closeIconWrapper: { padding: 4 },
  closeModalIcon: { fontSize: 20, color: '#666' },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelButtonText: { color: '#333', fontWeight: '600' },
  deleteConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteConfirmButtonText: { color: '#FFF', fontWeight: '600' },
});

export default ViewVideoScreen;
