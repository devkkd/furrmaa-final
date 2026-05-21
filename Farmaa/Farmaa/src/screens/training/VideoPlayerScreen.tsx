import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import api from '../../config/api';

const { width } = Dimensions.get('window');

function mapBackendVideoToLesson(video: any, index = 0) {
  const duration = video.duration ?? 14;
  return {
    _id: video._id,
    id: video._id,
    title: video.title || '(Video Title)',
    lessonNumber: index + 1,
    day: Math.ceil((index + 1) / 2),
    duration,
    durationDisplay: `${duration} min`,
    videoUrl: video.videoUrl,
    description: video.description || '',
    thumbnail: video.thumbnail,
  };
}

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { lesson, program, allLessons = [] } = (route.params as any) || {};
  const initialLesson = lesson || {
    id: 1,
    title: '(Video Title)',
    lessonNumber: 1,
    day: 1,
    duration: 14,
    durationDisplay: '14 min',
  };

  const [fetchedLesson, setFetchedLesson] = useState<any>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  const lessonData = fetchedLesson || initialLesson;

  const currentId = String(lessonData._id || lessonData.id);
  const currentIndex = allLessons.findIndex((l: any) => String(l._id || l.id) === currentId);
  const relatedLessons = currentIndex >= 0 ? allLessons.slice(currentIndex + 1) : allLessons.slice(1);

  useEffect(() => {
    const videoId = initialLesson._id || initialLesson.id;
    if (!videoId || (initialLesson.videoUrl && initialLesson.description)) {
      setLoadingLesson(false);
      return;
    }
    setLoadingLesson(true);
    api.CLIENT.get(`${api.ENDPOINTS.TRAINING_VIDEOS}/${videoId}`)
      .then((res) => {
        const video = res.data?.video;
        if (video) setFetchedLesson(mapBackendVideoToLesson(video, 0));
      })
      .catch(() => {})
      .finally(() => setLoadingLesson(false));
  }, [initialLesson._id, initialLesson.id]);

  const markCompleteSilent = async () => {
    if (!lessonData._id) return;
    try {
      await api.CLIENT.post(api.ENDPOINTS.TRAINING_PROGRESS, {
        videoId: lessonData._id,
        category: program?.category || 'basic',
      });
    } catch (_) {}
  };

  const handleMarkComplete = async () => {
    if (!lessonData._id) return;
    setMarkingComplete(true);
    try {
      await api.CLIENT.post(api.ENDPOINTS.TRAINING_PROGRESS, {
        videoId: lessonData._id,
        category: program?.category || 'basic',
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save progress');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handlePlayVideo = async () => {
    await markCompleteSilent();
    const url = lessonData.videoUrl;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open video'));
    } else if (url) {
      Alert.alert('Video', 'Video URL is not available for external playback.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{program?.title || 'Basic Training'}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <View style={styles.videoPlayer}>
            {loadingLesson ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : lessonData.thumbnail ? (
              <Image
                source={typeof lessonData.thumbnail === 'string' ? { uri: lessonData.thumbnail } : lessonData.thumbnail}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.videoPlaceholder}>🐕</Text>
            )}
            <TouchableOpacity style={styles.playOverlay} onPress={handlePlayVideo} activeOpacity={0.9}>
              <View style={styles.playButtonLarge}>
                <Text style={styles.playIconLarge}>▶</Text>
              </View>
              {lessonData.videoUrl && (
                <Text style={styles.tapToPlayText}>Tap to play video</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

          <View style={styles.content}>
            <View style={styles.videoInfoSection}>
              <Text style={styles.videoTitle}>{lessonData.title}</Text>
              <Text style={styles.videoSubtitle}>
                {lessonData.lessonNumber} Lesson | {lessonData.day} Day | {lessonData.durationDisplay || `${lessonData.duration ?? 14} min`}
              </Text>
              {lessonData._id && (
                <TouchableOpacity
                  style={styles.markCompleteButton}
                  onPress={handleMarkComplete}
                  disabled={markingComplete}
                >
                  {markingComplete ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.markCompleteButtonText}>✓ Mark as complete</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Video Description</Text>
              <Text style={styles.descriptionText}>
                {lessonData.description || 'No description available for this lesson.'}
              </Text>
            </View>

            {relatedLessons.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.sectionTitle}>Related Lessons</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedContainer}
                >
                  {relatedLessons.map((related: any) => (
                    <TouchableOpacity
                      key={related._id || related.id}
                      style={styles.relatedCard}
                      onPress={() =>
                        (navigation as any).navigate('VideoPlayer' as never, {
                          lesson: { ...related, videoUrl: related.videoUrl || related.video, title: related.title },
                          program,
                          allLessons,
                        } as never)
                      }
                    >
                      <View style={styles.relatedThumbnail}>
                        <Text style={styles.relatedThumbnailImage}>🐕</Text>
                        <View style={styles.relatedPlayButton}>
                          <Text style={styles.relatedPlayIcon}>▶</Text>
                        </View>
                      </View>
                      <Text style={styles.relatedTitle} numberOfLines={2}>
                        {related.title || `Lesson ${related.lessonNumber}`}
                      </Text>
                      <Text style={styles.relatedDuration}>
                        {related.durationDisplay || `${related.duration ?? 14} min`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Course Info Section */}
            <View style={styles.courseInfoSection}>
              <Text style={styles.sectionTitle}>About This Course</Text>
              <View style={styles.courseInfoCard}>
                <Text style={styles.courseInfoText}>
                  This course is part of the Basic Training program designed to
                  help your pet learn essential commands and build strong
                  foundations.
                </Text>
                <TouchableOpacity
                  style={styles.viewCourseButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.viewCourseButtonText}>
                    View Full Course →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
          </View>
      </ScrollView>
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
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 34,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: width * 0.56, // 16:9 aspect ratio
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    fontSize: 60,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconLarge: {
    fontSize: 32,
    color: '#1F2937',
    marginLeft: 4,
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#000000',
    gap: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#4B5563',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  fullscreenButton: {
    padding: 5,
  },
  fullscreenIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
  },
  videoInfoSection: {
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  videoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  tapToPlayText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  markCompleteButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    minWidth: 180,
    alignItems: 'center',
  },
  markCompleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  bottomPadding: {
    height: 100,
  },
  relatedSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  relatedContainer: {
    gap: 12,
    paddingRight: 15,
  },
  relatedCard: {
    width: 200,
    marginRight: 12,
  },
  relatedThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  relatedThumbnailImage: {
    fontSize: 50,
  },
  relatedPlayButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedPlayIcon: {
    fontSize: 18,
    color: '#1F2937',
    marginLeft: 2,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  relatedDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  courseInfoSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  courseInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
  courseInfoText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 15,
  },
  viewCourseButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewCourseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default VideoPlayerScreen;

