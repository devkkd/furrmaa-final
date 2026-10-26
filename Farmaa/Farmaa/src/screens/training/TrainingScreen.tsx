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
import { getTrainingPlanDefaults } from '../../data/trainingPlans';

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
  const [selectedPet, setSelectedPet] = useState<'dog' | 'cat'>('dog');
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [myTrainings, setMyTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchMyTrainings();
  }, []);

  useEffect(() => {
    setSelectedPlan('basic');
    fetchTrainingPrograms();
  }, [selectedPet, hasActiveSubscription]);

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
      setHasActiveSubscription(false);
    }
  };

  const fetchTrainingPrograms = async () => {
    const defaults = getTrainingPlanDefaults(selectedPet);
    const buildFromDefaults = (videos: any[] = []) => {
      const programsMap = new Map<string, any>();

      defaults.forEach((prog, index) => {
        const isBasic = prog.program === 'basic';
        programsMap.set(prog.program, {
          _id: prog.program,
          id: index + 1,
          category: prog.program,
          title: prog.title,
          description: prog.description,
          level: prog.program,
          petType: selectedPet,
          videos: [],
          isFree: prog.isFree,
          order: index + 1,
          bgColor: prog.bgColor,
          image: prog.image,
          textLight: prog.textLight,
          baseTags: prog.tags,
          isLocked: !isBasic && !hasActiveSubscription,
        });
      });

      videos.forEach((video: any) => {
        const petArr = Array.isArray(video.petType)
          ? video.petType
          : [video.petType || 'both'];
        const matchesPet =
          petArr.includes(selectedPet) ||
          petArr.includes('both') ||
          petArr.includes('Both');
        if (!matchesPet) return;

        const category = String(video.category || 'basic').toLowerCase();
        const key = ['basic', 'intermediate', 'advanced'].includes(category)
          ? category
          : 'basic';
        if (programsMap.has(key)) {
          programsMap.get(key)?.videos?.push(video);
        }
      });

      return Array.from(programsMap.values())
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((program) => {
          const videoCount = program.videos?.length || 0;
          const isBasic = program.category === 'basic';
          const countTags =
            videoCount > 0
              ? [`${videoCount} Lessons`, `${videoCount} Days`]
              : [];
          return {
            ...program,
            lessons: videoCount,
            days: videoCount,
            tags: [...(program.baseTags || []), ...countTags, 'View More Details'],
            isFree: isBasic,
            isLocked: !isBasic && !hasActiveSubscription,
          };
        });
    };

    try {
      setLoading(true);
      const response = await api.CLIENT.get(api.ENDPOINTS.TRAINING_VIDEOS, {
        params: { petType: selectedPet },
      });
      const videos = response.data?.videos || [];
      setTrainingPrograms(buildFromDefaults(videos));
    } catch {
      setTrainingPrograms(buildFromDefaults([]));
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

  const currentPlan =
    trainingPrograms.find((p) => p.category === selectedPlan) ||
    trainingPrograms[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header — same as website /training */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {selectedPet === 'cat' ? 'Cat Training' : 'Dog Training'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {selectedPet === 'cat'
              ? 'Start where your cat feels comfortable'
              : 'Start where your dog feels comfortable'}
          </Text>
          <View style={styles.petToggle}>
            <TouchableOpacity
              style={[styles.petToggleBtn, selectedPet === 'dog' && styles.petToggleBtnActive]}
              onPress={() => setSelectedPet('dog')}
            >
              <Text
                style={[
                  styles.petToggleText,
                  selectedPet === 'dog' && styles.petToggleTextActive,
                ]}
              >
                Dog
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.petToggleBtn, selectedPet === 'cat' && styles.petToggleBtnActive]}
              onPress={() => setSelectedPet('cat')}
            >
              <Text
                style={[
                  styles.petToggleText,
                  selectedPet === 'cat' && styles.petToggleTextActive,
                ]}
              >
                Cat
              </Text>
            </TouchableOpacity>
          </View>
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

            {/* Training Programs — website-style cards */}
            <View style={styles.programsContainer}>
              {trainingPrograms.map((program) => {
                const light = !program.textLight;
                return (
                  <TouchableOpacity
                    key={program.id}
                    activeOpacity={0.92}
                    onPress={() => {
                      setSelectedPlan(program.category);
                      handleStartTraining(program);
                    }}
                    style={[styles.programCard, { backgroundColor: program.bgColor }]}
                  >
                    {program.isFree ? (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE</Text>
                      </View>
                    ) : (
                      <View style={styles.lockBadge}>
                        <Image source={lockIcon} style={styles.lockIcon} />
                      </View>
                    )}

                    <View style={styles.programTextContainer}>
                      <Text
                        style={[
                          styles.programTitle,
                          !light && styles.programTitleLight,
                        ]}
                      >
                        {program.title}
                      </Text>
                      <Text
                        style={[
                          styles.programDescription,
                          !light && styles.programDescriptionLight,
                        ]}
                      >
                        {program.description}
                      </Text>

                      <View style={styles.pillsContainer}>
                        {(program.tags || []).map((tag: string) => (
                          <View
                            key={tag}
                            style={[styles.pill, !light && styles.lockPill]}
                          >
                            <Text
                              style={[
                                styles.pillText,
                                !light && styles.lockPillText,
                              ]}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <Text
                        style={[
                          styles.startButtonText,
                          !light && styles.lockText,
                        ]}
                      >
                        Let's Start →
                      </Text>
                    </View>

                    <Image source={program.image} style={styles.dogImage} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Progress strip — website style */}
            {currentPlan ? (
              <View
                style={[
                  styles.progressCard,
                  { backgroundColor: currentPlan.bgColor },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.progressTitle,
                      currentPlan.textLight && { color: '#FFFFFF' },
                    ]}
                  >
                    {currentPlan.title}
                  </Text>
                  <Text
                    style={[
                      styles.progressLessons,
                      currentPlan.textLight && { color: 'rgba(255,255,255,0.85)' },
                    ]}
                  >
                    LESSONS
                  </Text>
                </View>
                <View style={styles.progressBox}>
                  <Text style={styles.progressLabel}>Learning Progress</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '0%' }]} />
                  </View>
                  <Text style={styles.progressPct}>0%</Text>
                </View>
              </View>
            ) : null}
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
    marginBottom: 12,
  },
  petToggle: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  petToggleBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  petToggleBtnActive: {
    backgroundColor: '#1F2E46',
  },
  petToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  petToggleTextActive: {
    color: '#FFFFFF',
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
    gap: 16,
  },
  programCard: {
    borderRadius: 24,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 240,
  },
  freeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    zIndex: 2,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.4,
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 999,
  },
  lockIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  programTextContainer: {
    flex: 1,
    paddingRight: 110,
    zIndex: 1,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    paddingRight: 48,
  },
  programTitleLight: {
    color: '#FFFFFF',
  },
  programDescription: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 18,
    maxWidth: 220,
  },
  programDescriptionLight: {
    color: 'rgba(255,255,255,0.9)',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  pill: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.7)',
  },
  lockPill: {
    borderColor: 'rgba(255,255,255,0.75)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  lockPillText: {
    color: '#FFFFFF',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  lockText: {
    color: '#FFFFFF',
  },
  dogImage: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    width: 140,
    height: 150,
    resizeMode: 'contain',
  },
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  progressLessons: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 1.2,
  },
  progressBox: {
    backgroundColor: 'rgba(149,229,98,0.4)',
    borderRadius: 16,
    padding: 12,
    width: 150,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 999,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
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
