import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
  Alert,
  Share,
} from 'react-native';

// Video component from react-native-video (default export in v6)
let Video: any = null;
try {
  Video = require('react-native-video').default;
} catch (e) {
  console.warn('react-native-video not installed. Video playback will be limited.');
}
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import likeIcon from '../../assets/images/like-icon.png';
import likeIcon2 from '../../assets/images/like-icon-2.png';
import shareIcon from '../../assets/images/send-2.png';
import actionIcon from '../../assets/images/more.png';
import commentIcon from '../../assets/images/Group 173.png';
import reportIcon from '../../assets/images/warning-2.png';
import saveIcon from '../../assets/images/archive.png';
import savedIcon from '../../assets/images/archive2.png';
import cameraIcon from '../../assets/images/camera.png';
import petIcon from '../../assets/images/white-pet.png';
import muteIcon from '../../assets/images/volume-high.png';
import unmuteIcon from '../../assets/images/volume-slash.png';

const { width, height } = Dimensions.get('window');

interface Post {
  _id: string;
  content: string;
  images?: string[];
  videos?: string[];
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  pet?: {
    name: string;
    type: string;
  };
  likes: string[];
  comments: any[];
  createdAt: string;
}

const SocialFeedScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Feeds' | 'Trending'>('Feeds');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [mutedPosts, setMutedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [heartAnimations] = useState<{ [key: string]: Animated.Value }>({});
  const [showHeartOverlay, setShowHeartOverlay] = useState<{ [key: string]: boolean }>({});
  const [videoMuted, setVideoMuted] = useState<{ [key: string]: boolean }>({});
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [currentVisiblePostId, setCurrentVisiblePostId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.SOCIAL);
      const fetchedPosts = response.data?.posts || [];
      setPosts(fetchedPosts);
      
      // Initialize liked posts: backend sends likes as array of ids or populated { _id }
      const liked = new Set<string>();
      const userId = user?.id || (user as any)?._id;
      if (userId) {
        fetchedPosts.forEach((post: Post) => {
          const likesList = post.likes || [];
          const hasLiked = likesList.some((l: any) => (l?._id || l)?.toString() === userId.toString());
          if (hasLiked) liked.add(post._id);
        });
      }
      setLikedPosts(liked);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Feeds: latest first. Trending: sort by likes descending (sabse zyada like = top)
  const displayedPosts = activeTab === 'Feeds'
    ? posts
    : [...posts].sort((a: Post, b: Post) => (b.likes?.length || 0) - (a.likes?.length || 0));

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    const visible = viewableItems[0];
    if (visible?.item?._id) {
      setCurrentVisiblePostId(visible.item._id);
    } else {
      setCurrentVisiblePostId(null);
    }
  }, []);

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    const isLiked = likedPosts.has(postId);
    
    // Update local state immediately for better UX
    if (isLiked) {
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      setShowHeartOverlay((prev) => ({ ...prev, [postId]: false }));
    } else {
      setLikedPosts((prev) => new Set(prev).add(postId));
      
      // Show and animate heart overlay
      if (!heartAnimations[postId]) {
        heartAnimations[postId] = new Animated.Value(0);
      }
      
      setShowHeartOverlay((prev) => ({ ...prev, [postId]: true }));
      
      // Reset and animate
      heartAnimations[postId].setValue(0);
      Animated.sequence([
        Animated.timing(heartAnimations[postId], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(heartAnimations[postId], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeartOverlay((prev) => ({ ...prev, [postId]: false }));
      });
    }
    
    // Call API to update like on server (no full refresh – update only this post from response)
    try {
      const res = await api.CLIENT.put(api.ENDPOINTS.SOCIAL_LIKE.replace(':id', postId));
      const updatedPost = res.data?.post;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, likes: updatedPost.likes || p.likes } : p))
        );
      }
    } catch (error: any) {
      console.error('Failed to like post:', error);
      // Revert local state on error
      if (isLiked) {
        setLikedPosts((prev) => new Set(prev).add(postId));
      } else {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    }
  };

  const handleMute = (postId: string) => {
    const isMuted = mutedPosts.has(postId);
    
    if (isMuted) {
      setMutedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setMutedPosts((prev) => new Set(prev).add(postId));
    }
  };

  const handleVideoMute = (postId: string) => {
    setVideoMuted((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentPress = (postId: string) => {
    (navigation as any).navigate('Comments' as never, { postId } as never);
  };

  const handleShare = async (post: Post) => {
    try {
      const name = post.user?.name || 'Someone';
      const content = (post.content || '').trim().slice(0, 100);
      const message = content
        ? `${name} shared on Furrmaa: ${content}${content.length >= 100 ? '...' : ''}\n\nCheck out Furrmaa – pet care in one place.`
        : `${name} shared a post on Furrmaa. Check out Furrmaa – pet care in one place.`;
      await Share.share({
        message,
        title: 'Share from Furrmaa',
      });
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        console.warn('Share error:', e);
      }
    }
  };

  const handleOptionsPress = (postId: string) => {
    setSelectedPostId(postId);
    setShowOptionsModal(true);
  };

  const handleSave = () => {
    if (selectedPostId) {
      const isSaved = savedPosts.has(selectedPostId);
      if (isSaved) {
        setSavedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(selectedPostId);
          return newSet;
        });
      } else {
        setSavedPosts((prev) => new Set(prev).add(selectedPostId));
      }
    }
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    setShowReportConfirmation(true);
    // Auto close confirmation after 2 seconds
    setTimeout(() => {
      setShowReportConfirmation(false);
    }, 2000);
  };

  const renderPost = ({ item }: { item: any }) => {
    const isLiked = likedPosts.has(item._id);
    const isMuted = mutedPosts.has(item._id);
    const isVideoMuted = videoMuted[item._id] !== undefined ? videoMuted[item._id] : true;
    const isVideoInView = currentVisiblePostId === item._id;
    const likesCount = Array.isArray(item.likes) ? item.likes.length : (item.likes || 0);
    
    const heartScale = heartAnimations[item._id]?.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1.2, 1],
    }) || 0;
    
    const heartOpacity = heartAnimations[item._id] || new Animated.Value(0);

    return (
      <View style={styles.postContainer}>
        {/* Main Image/Video */}
        <View style={styles.imageContainer}>
          <View style={styles.postImage}>
            {item.videos && item.videos.length > 0 ? (
              Video ? (
                <Video
                  source={{ uri: item.videos[0] }}
                  style={styles.postImage}
                  resizeMode="cover"
                  paused={!isVideoInView}
                  muted={isVideoMuted}
                  repeat
                  controls={false}
                  playInBackground={false}
                  playWhenInactive={false}
                />
              ) : (
                <TouchableOpacity
                  style={styles.postImage}
                  onPress={() => {
                    Alert.alert(
                      'Video Playback',
                      'To play videos, please install react-native-video package.\n\nFor now, you can open the video in your browser.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Open in Browser',
                          onPress: () => Linking.openURL(item.videos[0]).catch(() => {
                            Alert.alert('Error', 'Could not open video URL');
                          })
                        }
                      ]
                    );
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.videoPlaceholder}>
                    <Text style={styles.videoPlaceholderIcon}>▶️</Text>
                    <Text style={styles.videoPlaceholderText}>Tap to play video</Text>
                  </View>
                </TouchableOpacity>
              )
            ) : item.images && item.images.length > 0 ? (
              <Image 
                source={{ uri: item.images[0] }} 
                style={styles.postImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.postImagePlaceholder}>
                <Text style={styles.postEmoji}>
                  {item.pet?.type === 'dog' ? '🐕' : item.pet?.type === 'cat' ? '🐱' : '📷'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Heart Overlay Animation - Show briefly when liked */}
          {showHeartOverlay[item._id] && heartAnimations[item._id] && (
            <Animated.View
              style={[
                styles.heartOverlay,
                {
                  opacity: heartAnimations[item._id],
                  transform: [
                    {
                      scale: heartAnimations[item._id].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={likeIcon2} style={styles.heartOverlayIcon} />
            </Animated.View>
          )}
          
          {/* Video Mute/Unmute Overlay - Only show for videos when muted (tap to unmute) */}
          {item.videos && item.videos.length > 0 && isVideoMuted && isVideoInView && (
            <TouchableOpacity
              style={styles.unmuteOverlay}
              onPress={() => handleVideoMute(item._id)}
              activeOpacity={0.8}
            >
              <View style={styles.unmuteIconContainer}>
                <Image source={muteIcon} style={styles.unmuteIcon} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Video Play Indicator */}
          {item.videos && item.videos.length > 0 && (
            <View style={styles.videoIndicator}>
              <Text style={styles.videoIndicatorText}>▶️ Video</Text>
            </View>
          )}

          {/* Mute Overlay (for post muting) */}
          {isMuted && (
            <View style={styles.muteOverlay}>
              <Image source={unmuteIcon} style={styles.muteIcon} />
            </View>
          )}

          {/* Right Sidebar Actions */}
          <View style={styles.actionSidebar}>
            <View style={styles.actionButton}>
              <TouchableOpacity onPress={() => handleLike(item._id)}>
                {isLiked ? (
                  <Image source={likeIcon2} style={styles.actionIcon} />
                ) : (
                  <Image source={likeIcon} style={styles.actionIcon} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  (navigation as any).navigate('Likes' as never, { postId: item._id } as never)
                }
              >
                <Text style={styles.actionCount}>{likesCount}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCommentPress(item._id)}
            >
              <Image source={commentIcon} style={styles.actionIcon} />
              <Text style={styles.actionCount}>{Array.isArray(item.comments) ? item.comments.length : (item.comments || 0)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Image source={shareIcon} style={styles.actionIcon} />
              <Text style={styles.actionCount}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleOptionsPress(item._id)}
            >
              <Image source={actionIcon} style={styles.actionIcon} />
            </TouchableOpacity>
          </View>

          {/* Bottom Left Post Details */}
          <View style={styles.postDetails}>
            <TouchableOpacity
              style={styles.profileSection}
              onPress={() => navigation.navigate('PetProfile' as never)}
            >
              <View style={styles.profileImage}>
                {item.user?.profileImage ? (
                  <Image 
                    source={{ uri: item.user.profileImage }} 
                    style={styles.profileEmoji} 
                  />
                ) : (
                  <Text style={styles.profileEmojiText}>
                    {item.pet?.type === 'dog' ? '🐕' : item.pet?.type === 'cat' ? '🐱' : '👤'}
                  </Text>
                )}
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.petName}>
                  {item.user?.name || 'User'} {item.pet ? `- ${item.pet.name}` : ''}
                </Text>
                <Text style={styles.postDescription}>{item.content || ''}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
        <StatusBar
          backgroundColor="#000000"
          barStyle="light-content"
          translucent={false}
        />
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navIcon}
          onPress={() => navigation.navigate('CreatePost' as never)}
        >
          <Image source={cameraIcon} style={styles.actionIcon} /> 
        </TouchableOpacity>
        
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Feeds' && styles.tabActive]}
            onPress={() => setActiveTab('Feeds')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Feeds' && styles.tabTextActive,
              ]}
            >
              Feeds
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Trending' && styles.tabActive]}
            onPress={() => setActiveTab('Trending')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Trending' && styles.tabTextActive,
              ]}
            >
              Trending
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navIcon}>
          <Image source={petIcon} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>

      {/* Feed Posts or Empty State */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.emptyDescription}>Loading posts...</Text>
        </View>
      ) : showEmptyState || displayedPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Your Feed Is Empty</Text>
          <Text style={styles.emptyDescription}>
            No feeds are available right now. Please check back after some
            time.
          </Text>
          <Text style={styles.emptySubtext}>
            A lively pet world starts with you.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              setShowEmptyState(false);
              fetchPosts();
            }}
          >
            <Text style={styles.emptyButtonText}>Try Again →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModalContent}>
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Options</Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.optionsButtonsContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleSave}
              >
                <View
                  style={[
                    styles.optionIconContainer,
                    selectedPostId &&
                      savedPosts.has(selectedPostId) &&
                      styles.optionIconContainerSaved,
                  ]}
                >
                  
                  <Image
                    style={styles.optionIcon}
                    source={
                      selectedPostId && savedPosts.has(selectedPostId)
                        ? savedIcon
                        : saveIcon
                    }
                  />

                </View>
                <Text style={styles.optionText}>
                  {selectedPostId && savedPosts.has(selectedPostId)
                    ? 'Saved'
                    : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleReport}
              >
                <View style={styles.reportIconContainer}>
                  <Image source={reportIcon} style={styles.reportIcon} />
                </View>
                <Text style={styles.optionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Confirmation Modal */}
      <Modal
        visible={showReportConfirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportConfirmation(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReportConfirmation(false)}
        >
          <View style={styles.reportConfirmationContent}>
            <View style={styles.checkmarkIconContainer}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>

            <Text style={styles.reportConfirmationText}>
              Thank you for reporting this Reel. We have reviewed it.
            </Text>
          </View>

        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topNav: {
    position: 'absolute',
    top: StatusBar.currentHeight || 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  navIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  tab: {
    paddingVertical: 5,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '400',
  },
  tabTextActive: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  postContainer: {
    width: width,
    height: height,
    backgroundColor: '#000000',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1A1A',
  },
  postImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postEmoji: {
    fontSize: 60,
  },
  profileEmojiText: {
    fontSize: 24,
  },
  heartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartOverlayIcon: {
    width: 80,
    height: 80,
  },
  unmuteOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unmuteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  unmuteIcon: {
    width: 40,
    height: 40,
  },
  muteOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteIcon: {
    width: 40,
    height: 40,
  },
  videoIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  videoIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  videoPlaceholderIcon: {
    fontSize: 60,
    marginBottom: 10,
  },
  videoPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionSidebar: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 5,
  },
  actionIcon: {
    height: 30,
    width: 30,
    marginBottom: 5,
    tintColor: '#FFFFFF',
  },
  actionCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  postDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    marginBottom: 100,
    maxWidth: width - 90, 
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileEmoji: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  postInfo: {
    flex: 1,
    paddingTop: 2,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 8,
  },
  musicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#0E0E0E80',
    borderRadius: 12,
    alignSelf: 'flex-start',
    padding:5,
  },
  musicIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  musicName: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000000',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  optionsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  optionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  optionsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#1d1e1f',
    fontWeight: 'bold',
  },
  optionsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    gap: 8,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  optionIconContainerSaved: {
    borderColor: '#1F2937',
  },
  optionIcon: {
    width: 28,
    height: 28,
  },
  reportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  reportIcon: {
    width: 28,
    height: 28,
  },
  optionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  reportConfirmationContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    paddingVertical: 30,
    alignItems: 'flex-start', 
  },

  checkmarkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#95E562',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12, 
  },

  checkmarkIcon: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },

  reportConfirmationText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    textAlign: 'center',
  },

});

export default SocialFeedScreen;
