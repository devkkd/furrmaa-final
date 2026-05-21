import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import lockIcon from '../../assets/images/lock.png';
import btDogImage from '../../assets/images/BTdog.png';
import itDogImage from '../../assets/images/ITdog.png';
import atDogImage from '../../assets/images/ATdog.png';

interface TrainingProgram {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  petType: string;
  videos?: any[];
  isFree?: boolean;
  order?: number;
}

const TrainingScreen = () => {
  const navigation = useNavigation();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Fetch training videos from backend
  useEffect(() => {
    const loadData = async () => {
      await fetchSubscription();
      await fetchTrainingPrograms();
      await fetchMyTrainings();
    };
    loadData();
  }, []);

  const fetchMyTrainings = async () => {
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.TRAINING_MY);
      setMyTrainings(response.data?.trainings || []);
    } catch {
      setMyTrainings([]);
    }
  };

  // Fetch user subscription status
  const fetchSubscription = async () => {
    try {
      const response = await api.CLIENT.get(api.ENDPOINTS.SUBSCRIPTION);
      const subData = response.data?.subscription;
      
      // Check if user has active paid subscription
      const isActive = subData?.isActive && subData?.plan !== 'free';
      const hasValidEndDate = !subData?.endDate || new Date(subData.endDate) > new Date();
      setHasActiveSubscription(isActive && hasValidEndDate);
    } catch (error: any) {
      console.error('Failed to fetch subscription:', error);
      setHasActiveSubscription(false);
    }
  };

  const fetchTrainingPrograms = async () => {
    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.TRAINING_VIDEOS);
      const videos = response.data?.videos || [];
      
      // Group videos by courseLevel (Basic Training, Intermediate Training, Advanced Training)
      const programsMap = new Map<string, any>();
      
      // Default programs with UI images
      const defaultPrograms = [
        {
          _id: 'basic',
          category: 'basic',
          courseLevel: 'Basic Training',
          title: 'Basic Training',
          description: 'Foundational skills, obedience, and leash training.',
          level: 'beginner',
          isFree: true,
          order: 1,
          bgColor: '#FED7AA',
          image: btDogImage,
        },
        {
          _id: 'intermediate',
          category: 'intermediate',
          courseLevel: 'Intermediate Training',
          title: 'Intermediate Training',
          description: 'Discipline behavior, shaping control',
          level: 'intermediate',
          isFree: false,
          order: 2,
          bgColor: '#cd8178',
          image: itDogImage,
        },
        {
          _id: 'advanced',
          category: 'advanced',
          courseLevel: 'Advanced Training',
          title: 'Advanced Training',
          description: 'Master-level commands, agility, obedience.',
          level: 'advanced',
          isFree: false,
          order: 3,
          bgColor: '#8684f6',
          image: atDogImage,
        },
      ];
      
      // Initialize programs
      defaultPrograms.forEach((prog) => {
        const isBasic = prog.category === 'basic';
        programsMap.set(prog.category, {
          _id: prog._id,
          id: prog._id === 'basic' ? 1 : prog._id === 'intermediate' ? 2 : 3,
          title: prog.title,
          description: prog.description,
          category: prog.category,
          level: prog.level,
          petType: 'dog',
          videos: [],
          isFree: isBasic,
          order: prog.order,
          bgColor: prog.bgColor,
          image: prog.image,
          isLocked: !isBasic && !hasActiveSubscription, // Lock if not basic and no subscription
        });
      });
      
      // Group videos by category
      videos.forEach((video: any) => {
        const category = video.category || 'basic';
        const courseLevel = video.courseLevel || (category === 'basic' ? 'Basic Training' : category === 'intermediate' ? 'Intermediate Training' : 'Advanced Training');
        
        if (programsMap.has(category)) {
          programsMap.get(category)?.videos?.push(video);
        } else {
          // Create new program if category doesn't exist
          const isBasic = category === 'basic';
          programsMap.set(category, {
            _id: category,
            id: programsMap.size + 1,
            title: courseLevel,
            description: video.description || `${courseLevel} training program`,
            category: category,
            level: video.level || 'beginner',
            petType: Array.isArray(video.petType) ? video.petType[0] : video.petType || 'dog',
            videos: [video],
            isFree: isBasic,
            order: video.order || 0,
            bgColor: category === 'basic' ? '#FED7AA' : category === 'intermediate' ? '#cd8178' : '#8684f6',
            image: category === 'basic' ? btDogImage : category === 'intermediate' ? itDogImage : atDogImage,
            isLocked: !isBasic && !hasActiveSubscription, // Lock if not basic and no subscription
          });
        }
      });
      
      // Convert map to array and sort by order
      const programs = Array.from(programsMap.values())
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((program) => {
          const videoCount = program.videos?.length || 0;
          const totalDuration = program.videos?.reduce((sum: number, v: any) => sum + (v.duration || 0), 0) || 0;
          const days = Math.ceil(totalDuration / 60) || videoCount; // Convert minutes to days
          const isBasic = program.category === 'basic';
          
          return {
            ...program,
            lessons: videoCount || (program.id === 1 ? 7 : program.id === 2 ? 14 : 21),
            days: days || (program.id === 1 ? 7 : program.id === 2 ? 14 : 21),
            ways: videoCount || (program.id === 1 ? 7 : program.id === 2 ? 14 : 21),
            isFree: isBasic, // Basic training is always free
            isLocked: !isBasic && !hasActiveSubscription, // Lock intermediate/advanced if no subscription
          };
        });
      
      setTrainingPrograms(programs);
    } catch (error: any) {
      console.error('Failed to fetch training programs:', error);
      // Fallback to default programs if API fails
      setTrainingPrograms([
        {
          id: 1,
          title: 'Basic Training',
          description: 'Foundational skills, obedience, and leash training.',
          lessons: 7,
          days: 7,
          ways: 7,
          bgColor: '#FED7AA',
          image: btDogImage,
          isFree: true,
          isLocked: false,
        },
        {
          id: 2,
          title: 'Intermediate Training',
          description: 'Discipline behavior, shaping control',
          lessons: 14,
          days: 14,
          ways: 14,
          bgColor: '#cd8178',
          image: itDogImage,
          isFree: false,
          isLocked: true,
        },
        {
          id: 3,
          title: 'Advanced Training',
          description: 'Master-level commands, agility, obedience.',
          lessons: 21,
          days: 21,
          ways: 21,
          bgColor: '#8684f6',
          image: atDogImage,
          isFree: false,
          isLocked: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = (program: any) => {
    if (program.isLocked) {
      // Show options modal for locked programs
      setSelectedProgram(program);
      setShowOptionsModal(true);
      return;
    }
    // For Basic Training (unlocked), navigate directly
    (navigation as any).navigate('TrainingLessons' as never, { program } as never);
  };

  const handleWatchPreview = () => {
    setShowOptionsModal(false);
    // Navigate to lessons screen to show preview
    (navigation as any).navigate('TrainingLessons' as never, { program: selectedProgram } as never);
  };

  const handleSubscribe = () => {
    setShowOptionsModal(false);
    (navigation as any).navigate('Subscription' as never, { program: selectedProgram } as never);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Train</Text>
          <Text style={styles.headerSubtitle}>
            Start where your pet feels comfortable
          </Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={styles.loadingText}>Loading training programs...</Text>
          </View>
        ) : trainingPrograms.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No Training Sessions Available
            </Text>
            <Text style={styles.emptyDescription}>
              We couldn't find any training programs right now. Try adjusting
              filters or check back soon as new sessions are added regularly.
            </Text>

            <Text style={styles.emptyEmphasis}>
              Every good pet starts with good guidance.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                // Navigate to explore
                navigation.navigate('ExploreTab' as never);
              }}
            >
              <Text style={styles.emptyButtonText}>Explore app →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {myTrainings.length > 0 && (
              <View style={styles.myTrainingsSection}>
                <Text style={styles.myTrainingsTitle}>My training enrollments</Text>
                {myTrainings.map((t) => (
                  <View key={t._id} style={styles.myTrainingCard}>
                    <Text style={styles.myTrainingPet}>
                      {t.pet?.name || 'Pet'} · {t.program || 'Program'}
                    </Text>
                    <Text style={styles.myTrainingMeta}>
                      Status: {t.status || 'scheduled'}
                      {t.trainer?.name ? ` · Trainer: ${t.trainer.name}` : ''}
                    </Text>
                    {t.startDate ? (
                      <Text style={styles.myTrainingDate}>
                        Started {new Date(t.startDate).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Training Programs */}
            <View style={styles.programsContainer}>
              {trainingPrograms.map((program) => (
            <View
              key={program.id}
              style={[styles.programCard, { backgroundColor: program.bgColor }]}
            >
              {/* Free/Locked Badge */}
              {program.isFree && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>Free</Text>
                </View>
              )}
              {program.isLocked && (
                <View style={styles.lockBadge}>
                  <Image source={lockIcon} style={styles.lockIcon} />
                </View>
              )}

              {/* Program Content */}
              <View style={styles.programContent}>
                <View style={styles.programTextContainer}>
                  <Text style={program.isLocked ? styles.lockedProgramTitle : styles.programTitle}>{program.title}</Text>
                  <Text style={program.isLocked ? styles.lockedProgramDescription : styles.programDescription}>
                    {program.description}
                  </Text>

                  {/* Pills */}
                  <View style={styles.pillsContainer}>
                    <View style={program.isLocked ? styles.lockPill : styles.pill}>
                      <Text style={ program.isLocked ? styles.lockPillText : styles.pillText }>
                        {program.lessons} Lessons
                      </Text>
                    </View>
                    <View style={program.isLocked ? styles.lockPill : styles.pill}>
                      <Text style={program.isLocked ? styles.lockPillText : styles.pillText}>{program.days} Days</Text>
                    </View>
                    <View style={program.isLocked ? styles.lockPill : styles.pill}>
                      <Text style={program.isLocked ? styles.lockPillText : styles.pillText}>
                        {program.ways} Great Ways to Training
                      </Text>
                    </View>
                  </View>

                  {/* Start Button */}
                  <TouchableOpacity
                    style={[
                      styles.startButton,
                      
                    ]}
                    onPress={() => handleStartTraining(program)}
                  >
                    <Text style={program.isLocked ? styles.lockText : styles.startButtonText}>Let's Start ➜</Text>
                  </TouchableOpacity>
                </View>

                {/* Dog Image */}
                
                  <Image source={program.image} style={styles.dogImage} />
               
              </View>
            </View>
          ))}
        </View>
          </>
        )}

        {/* Footer */}
        {trainingPrograms.length > 0 && (
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerSmallText}>
            Made With Gentle Care in Jaipur, India
          </Text>

          <Text style={styles.footerMainText}>
            Because Your Pet{'\n'}Deserves the Very Best 🐾
          </Text>
        </View>
        )}
      </ScrollView>

      {/* Options Modal for Locked Programs */}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedProgram?.title || 'Training Program'}
              </Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>
              Choose an option to continue:
            </Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleWatchPreview}
            >
              <Text style={styles.modalOptionIcon}>▶</Text>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>Watch Preview Videos</Text>
                <Text style={styles.modalOptionSubtitle}>
                  View course structure and preview lessons
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleSubscribe}
            >
              <Text style={styles.modalOptionIcon}>🔓</Text>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionTitle}>Subscribe to Unlock</Text>
                <Text style={styles.modalOptionSubtitle}>
                  Get full access to all videos and lessons
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  myTrainingsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  myTrainingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  myTrainingCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  myTrainingPet: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  myTrainingMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  myTrainingDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  programsContainer: {
    padding: 20,
    gap: 20,
  },
  programCard: {
    borderRadius: 16,
    padding: 15,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 200,
    paddingTop: 24,
  },
  freeBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    zIndex: 1,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  lockBadge: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 1,
    elevation: 6,
    backgroundColor: 'rgba(200, 188, 188, 0.3)',
    padding: 10,
    borderRadius: 14,
  },
  lockIcon: {
    width: 26,
    height: 26,
  },
  programContent: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  programTextContainer: {
    flex: 1,
    // marginRight: 15,
    paddingRight: 120, 
  },
  programTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
  marginBottom: 6,
},
lockedProgramTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#fefefe',
  marginBottom: 6,
},
programDescription: {
  fontSize: 14,
  color: '#374151',
  marginBottom: 12,
},
lockedProgramDescription: {
  fontSize: 14,
  color: '#fefefe',
  marginBottom: 12,
},
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  pill: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#000000',
    
  },
  lockPill: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  lockPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startButton: {
    paddingHorizontal: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  lockText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dogImageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',

  },
  dogImage: {
  position: 'absolute',
  right: -10,
  bottom: -10,
  width: 160,
  height: 200,
  resizeMode: 'contain',
},

  footerTextContainer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },

  footerSmallText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },

  footerMainText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 34,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
    minHeight: 800,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
emptyDescription: {
  fontSize: 14,
  color: '#6B7280',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 12,
  paddingHorizontal: 20,
  fontWeight: '500',
},

emptyEmphasis: {
  fontSize: 14,
  color: '#1F2937',
  fontWeight: '800',
  textAlign: 'center',
  marginBottom: 30,
},
  emptyButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 15,
    color: '#1E3A8A',
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default TrainingScreen;
