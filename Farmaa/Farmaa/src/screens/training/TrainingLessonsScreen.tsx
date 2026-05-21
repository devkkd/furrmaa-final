import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import btThumbnail from '../../assets/images/btThumbnail.png';
import atThumbnail from '../../assets/images/atThumbnail.png';
import itThumbnail from '../../assets/images/itThumbnail.png';
import leftArrow from '../../assets/images/arrow-left.png';
import btCourseImage1 from '../../assets/images/btCourseImage1.png';
import btCourseImage2 from '../../assets/images/btCourseImage2.png';
import btCourseImage3 from '../../assets/images/btCourseImage3.png';
import trainerImage1 from '../../assets/images/trainerImage1.png';
import blackLock from '../../assets/images/lock black.png';
import downArrow from '../../assets/images/arrow-right.png';

const TrainingLessonsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const { program } = (route.params as any) || {
    id: 1,
    title: 'Basic Training',
    description: 'Foundation skills, simple commands, bonding.',
    lessons: 7,
    days: 7,
    ways: 7,
    bgColor: '#FED7AA',
    image: '🐕',
    isFree: true,
  };

  const [activeTab, setActiveTab] = useState('Lessons');
  const [progress, setProgress] = useState(0);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
  });
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [trainerDetails, setTrainerDetails] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Fetch subscription first, then videos + progress (web jaisa)
  useEffect(() => {
    const loadData = async () => {
      await fetchSubscription();
      await fetchTrainingVideos();
    };
    loadData();
  }, [program?.category, program?.level]);

  useFocusEffect(
    React.useCallback(() => {
      fetchSubscription();
      refreshProgress();
    }, [program?.category])
  );

  const refreshProgress = async () => {
    if (!isAuthenticated) return;
    try {
      const progressRes = await api.CLIENT.get(api.ENDPOINTS.TRAINING_PROGRESS);
      const completedVideoIds: string[] = (progressRes.data?.completedVideoIds || []).map(String);
      setVideos((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.map((l: any) => ({
          ...l,
          isCompleted: completedVideoIds.includes(String(l._id || l.id)),
        }));
        const freeList = next.filter((l: any) => program?.isFree || !l.isLocked);
        const completedFree = freeList.filter((l: any) => l.isCompleted).length;
        const totalFree = freeList.length;
        const pct = totalFree > 0 ? Math.round((completedFree / totalFree) * 100) : 0;
        setProgress(Math.min(100, Math.max(0, pct)));
        return next;
      });
    } catch (_) {}
  };

  const fetchSubscription = async () => {
    if (!isAuthenticated) {
      setHasActiveSubscription(false);
      return;
    }
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.SUBSCRIPTION);
      const subData = response.data?.subscription;
      setSubscription(subData);
      
      // Check if user has active paid subscription
      const isActive = subData?.isActive && subData?.plan !== 'free';
      const hasValidEndDate = !subData?.endDate || new Date(subData.endDate) > new Date();
      const hasActive = isActive && hasValidEndDate;
      setHasActiveSubscription(hasActive);
      
      // Update video lock status based on subscription
      setVideos((prevVideos) => {
        return prevVideos.map((lesson: any) => {
          const isVideoFree = lesson.isFree || program.category === 'basic';
          const isVideoPremium = lesson.isPremium || (!isVideoFree && program.category !== 'basic');
          const shouldLock = isVideoPremium && !hasActive && !program.isFree;
          return { ...lesson, isLocked: shouldLock };
        });
      });
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch subscription:', error);
      }
      setHasActiveSubscription(false);
    }
  };

  const fetchTrainingVideos = async () => {
    try {
      setLoading(true);
      const category = program.category || 'basic';

      // Subscription status for lock (web jaisa) – yahi se check karo
      let hasActive = false;
      if (isAuthenticated) {
        try {
          const subRes = await api.CLIENT.get(api.ENDPOINTS.SUBSCRIPTION);
          const subData = subRes.data?.subscription;
          hasActive = !!(subData?.isActive && subData?.plan !== 'free' && (!subData?.endDate || new Date(subData.endDate) > new Date()));
        } catch (_) {}
      }

      const response = await api.CLIENT.get(api.ENDPOINTS.TRAINING_VIDEOS, {
        params: { category, level: program.level },
      });
      const fetchedVideos = response.data?.videos || [];

      // Fetch progress (same as web) to merge completed state
      let completedVideoIds: string[] = [];
      if (isAuthenticated) {
        try {
          const progressRes = await api.CLIENT.get(api.ENDPOINTS.TRAINING_PROGRESS);
          completedVideoIds = (progressRes.data?.completedVideoIds || []).map(String);
        } catch (_) {}
      }

      // Map videos to lessons – web jaisa backend se
      const mappedLessons = fetchedVideos.map((video: any, index: number) => {
        const isVideoFree = video.isFree !== false && (video.category === 'basic' || program.isFree);
        const isVideoPremium = video.isPremium || (!isVideoFree && video.category !== 'basic');
        const shouldLock = isVideoPremium && !hasActive && !program.isFree;

        let thumbnailSource = btThumbnail;
        if (video.thumbnail && typeof video.thumbnail === 'string') {
          if (video.thumbnail.startsWith('http') || video.thumbnail.startsWith('https')) {
            thumbnailSource = { uri: video.thumbnail };
          }
        }

        const vidId = String(video._id || video.id);
        return {
          _id: video._id,
          id: video._id,
          title: video.title || '[Video Title]',
          lessonNumber: index + 1,
          day: index + 1,
          duration: video.duration ?? 14,
          durationDisplay: `${video.duration ?? 14} min`,
          thumbnail: thumbnailSource,
          videoUrl: video.videoUrl,
          description: video.description,
          isCompleted: completedVideoIds.includes(vidId),
          isLocked: shouldLock,
          isFree: isVideoFree,
          isPremium: isVideoPremium,
        };
      });

      setVideos(mappedLessons);

      // Progress 0–100% only (web jaisa)
      const freeList = mappedLessons.filter((l: any) => program?.isFree || !l.isLocked);
      const completedFree = freeList.filter((l: any) => completedVideoIds.includes(String(l._id || l.id))).length;
      const totalFree = freeList.length;
      const pct = totalFree > 0 ? Math.round((completedFree / totalFree) * 100) : 0;
      setProgress(Math.min(100, Math.max(0, pct)));

      // Course details from first video / program
      if (fetchedVideos.length > 0) {
        const firstVideo = fetchedVideos[0];
        setCourseDetails({
          courseDuration: program.days || fetchedVideos.length,
          lessonsCount: fetchedVideos.length,
          quizzesCount: firstVideo.quizzesCount ?? 0,
          difficulty: firstVideo.difficulty || 'Easy',
          courseDescription: firstVideo.courseDescription || program.description || 'Comprehensive training course designed to help you and your pet succeed.',
        });

        // Trainer from backend (web jaisa) – instructor object
        const inst = firstVideo.instructor;
        setTrainerDetails({
          name: inst?.name || 'Furrmaa Team',
          title: inst?.title || 'Certified Pet Trainer',
          bio: inst?.bio || 'Experienced pet trainer with years of expertise in pet care and training.',
          image: inst?.image,
          specialization: inst?.specialization,
          experience: inst?.experience ?? 8,
        });
      } else {
        setCourseDetails(null);
        setTrainerDetails(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch training videos:', error);
      setVideos([]);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // All lessons from backend API only (no static data)
  const lessons = videos;
  const isBasicTraining = program.category === 'basic' || program.isFree;
  const isLocked = program.isLocked;

  const tabs = ['Lessons', 'Course', 'Trainer'];

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [week]: !prev[week],
    }));
  };

  const handleLessonPress = async (lesson: any) => {
    // Re-check subscription before allowing access
    if (lesson.isLocked || (lesson.isPremium && !hasActiveSubscription)) {
      // Navigate to subscription
      handleSubscribe();
      return;
    }
    
    // Free videos or user with subscription can access
    (navigation as any).navigate('VideoPlayer' as never, {
      lesson: {
        ...lesson,
        videoUrl: lesson.videoUrl || lesson.video,
        title: lesson.title,
      },
      program,
      allLessons: lessons,
    } as never);
  };

  const handleSubscribe = () => {
    (navigation as any).navigate('Subscription' as never, { program } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{program.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Program Overview Card */}
        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor:
                activeTab === 'Course' && isBasicTraining
                  ? '#FED7AA'
                  : activeTab === 'Trainer' && isBasicTraining
                  ? '#FED7AA'
                  : program.bgColor,
            },
          ]}
        >
          {program.isFree && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>Free</Text>
            </View>
          )}
          {isLocked && (
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>Subscribe Now ➜</Text>
            </TouchableOpacity>
          )}
          <View style={styles.overviewContent}>
            <View style={styles.overviewText}>
              <Text style={[styles.overviewTitle, isBasicTraining && { color: '#000000' }]}>{program.title}</Text>
              <Text style={[styles.overviewDescription, isBasicTraining && { color: '#000000' }]}>
                {program.description}
              </Text>
            </View>
            <View style={styles.dogImageContainer}>
              <Image source={program.image} style={styles.dogImage} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>

                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Learning Progress – 0–100% only (web jaisa) */}
        {activeTab === 'Lessons' && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Learning Progress</Text>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]}
              />
            </View>

            <Text style={styles.progressText}>{Math.min(100, Math.max(0, progress))}%</Text>
          </View>
        </View>
        )}

        {/* Lessons List */}
        {activeTab === 'Lessons' && (
          <View style={styles.lessonsContainer}>
            {lessons.length === 0 ? (
              <View style={styles.emptyLessonsContainer}>
                <Text style={styles.emptyLessonsTitle}>
                  No Course Videos Yet
                </Text>
                <Text style={styles.emptyLessonsDescription}>
                  No videos available for this program yet. Check back later or subscribe for more content.
                </Text>
                <TouchableOpacity
                  style={styles.emptyLessonsButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.emptyLessonsButtonText}>
                    Browse Train →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson._id || lesson.id}
                  style={styles.lessonCard}
                  onPress={() => handleLessonPress(lesson)}
                  disabled={lesson.isLocked}
                >
                  <View style={styles.lessonThumbnail}>
                    <Image source={lesson.thumbnail} style={styles.lessonThumbnailImage} />
                  </View>
                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDetails}>
                      {lesson.lessonNumber} Lesson | {lesson.day} Day | {lesson.durationDisplay || `${lesson.duration || 14} Min`}
                    </Text>
                  </View>
                  <View style={styles.lessonActions}>
                    {lesson.isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    )}
                    {lesson.isLocked ? (
                      <View style={styles.lockButton}>
                        <Image source={blackLock} style={styles.lockIcon} />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handleLessonPress(lesson)}
                      >
                        <Text style={styles.playIcon}>▶</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Course Tab */}
        {activeTab === 'Course' && (
          <View style={styles.courseContainer}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  About This {program.title}
                </Text>
                <Text style={styles.pawIcon}>🐾</Text>
              </View>
              <View style={styles.courseInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Course Duration:</Text>
                  <Text style={styles.infoValue}>
                    {courseDetails?.courseDuration || program.days || 7} Days
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lessons:</Text>
                  <Text style={styles.infoValue}>
                    {courseDetails?.lessonsCount || program.lessons || videos.length} Lessons
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Quiz:</Text>
                  <Text style={styles.infoValue}>
                    {courseDetails?.quizzesCount || 0} Quiz
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Difficulty:</Text>
                  <Text style={styles.infoValue}>
                    {courseDetails?.difficulty || 'Easy'}
                  </Text>
                </View>
              </View>
              <Text style={styles.courseDescription}>
                {courseDetails?.courseDescription || program.description || (isBasicTraining
                  ? 'Build strong foundations with simple, effective training lessons designed to help your pet learn essential commands, good manners, and positive habits—one step at a time.'
                  : 'Building strong foundations with simple, effective training lessons designed to help your pet learn essential commands, good manners, and a joyful, well-adjusted life at home.')}
              </Text>
            </View>

            {/* Image Gallery */}
            <View style={styles.gallerySection}>
              <View style={styles.galleryContainer}>
                <View style={styles.galleryImage}>
                  <Image source={btCourseImage1} style={styles.galleryImageEmoji}/>
                </View>
                <View style={styles.galleryImage}>
                  <Image source={btCourseImage2} style={styles.galleryImageEmoji}/>
                </View>
                <View style={styles.galleryImage}>
                  <Image source={btCourseImage3} style={styles.galleryImageEmoji}/>
                </View>
              </View>
            </View>

            {/* Subscribe Button for Locked Courses */}
            {isLocked && (
              <TouchableOpacity
                style={styles.subscribeBottomButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeBottomButtonText}>
                  Subscribe Now to Unlock Video
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Trainer Tab */}
        {activeTab === 'Trainer' && (
          <View style={styles.trainerContainer}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Meet Your Trainer</Text>
                <Text style={styles.pawIcon}>🐾</Text>
              </View>
              <View style={styles.trainerProfile}>
                <View style={styles.trainerImageContainer}>
                  {trainerDetails?.image ? (
                    <Image source={{ uri: trainerDetails.image }} style={styles.trainerImage} />
                  ) : (
                    <Image source={trainerImage1} style={styles.trainerImage} />
                  )}
                </View>
                <View style={styles.trainerInfo}>
                  <Text style={styles.trainerName}>{trainerDetails?.name || 'John Doe'}</Text>
                  <Text style={styles.trainerDetail}>
                    {trainerDetails?.title || 'Certified Pet Trainer'} - {trainerDetails?.experience || 8}+ Years
                  </Text>
                  {trainerDetails?.specialization && (
                    <Text style={styles.trainerDetail}>
                      {trainerDetails.specialization}
                    </Text>
                  )}
                  {trainerDetails?.bio && (
                    <Text style={styles.trainerBio}>
                      {trainerDetails.bio}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {/* Subscribe Button for Locked Courses */}
      <View style={styles.footer}>
        {isLocked && (
          <TouchableOpacity
            style={styles.subscribeBottomButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeBottomButtonText}>
              Subscribe Now to Unlock Video ➜
            </Text>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 34,
  },
  overviewCard: {
    margin: 15,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 190,
  },
  freeBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    zIndex: 1,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  subscribeButton: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    zIndex: 1,
  },
  subscribeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  overviewText: {
    flex: 1,
    marginRight: 15,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  overviewDescription: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  dogImageContainer: {
    paddingTop: 50,
    width: '50%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dogImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },

  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -1,             
    height: 2,
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 2,
  },


  progressSection: {
    backgroundColor: '#95E562',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    margin: 15,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginRight: 12,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#9CA3AF',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  lessonsContainer: {
    padding: 15,
  },
  weekSection: {
    marginBottom: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  expandIcon: {
    height: 18,
    width: 18,
},
  weekLessons: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8E939A',
    alignItems: 'center',
  },
  lessonThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lessonThumbnailImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    borderRadius: 15,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  lessonDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    backgroundColor: '#95E562',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2E46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  lockButton: {
    width: 18,
    height: 18,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    top: -20,
    right: -6,
  },
  lockIcon: {
    width: 18,
    height: 18,
  },
  footer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: 16,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  alignItems: 'center',
  // marginTop: 240,
},
  subscribeBottomButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: 'center',
    paddingHorizontal: 40,
    
  },
  subscribeBottomButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  courseContainer: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1F2937',
    paddingLeft: 10,
  },
  pawIcon: {
    fontSize: 18,
  },
  courseInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 3,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',  
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  infoLabel: {
    width: 150,                 
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',

  },
  gallerySection: {
    marginTop: 10,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  galleryContainer: {
    gap: 12,
  },
  galleryImage: {
    width: '100%',
    height: 230,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  galleryImageEmoji: {
    width: '100%',
    height: '100%',
    borderRadius:16,
  },
  trainerProfile: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 14,
  paddingVertical: 16,
  paddingHorizontal: 15,
},
trainerContainer: {
    padding: 15,
  },
trainerImageContainer: {
    width: 120,
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },

  trainerImage: {
    width: '100%',
    height: '100%',
  },

  trainerInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },

  trainerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },

  trainerDetail: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  trainerBio: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 20,
  },
  courseDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 12,
    paddingHorizontal: 15,
  },
  emptyLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
    minHeight: 300,
  },
  emptyLessonsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyLessonsDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  emptyLessonsButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  emptyLessonsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyEmphasis: {
  fontSize: 14,
  color: '#1F2937',
  fontWeight: '800',
  textAlign: 'center',
  marginBottom: 30,
},
});

export default TrainingLessonsScreen;
