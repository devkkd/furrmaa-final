import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import leftArrow from '../../assets/images/arrow-left.png';
import ownerIcon from '../../assets/images/ownerIcon.jpg';
import adoptionCompleteIcon from '../../assets/images/tick-circle.png'
import deleteIcon from '../../assets/images/trash.png'
import deleteIcon2 from '../../assets/images/trash-2.png'
import api from '../../config/api';

const HopeDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pet } = route.params as any;
  const [showOptions, setShowOptions] = useState(false);
  const [showReportDone, setShowReportDone] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petData, setPetData] = useState(pet || null);

  useEffect(() => {
    if (!pet?._id) return;
    (async () => {
      try {
        const res = await api.CLIENT.get(`${api.ENDPOINTS.HOPE}/posts/${pet._id}`);
        if (res.data?.post) setPetData(res.data.post);
      } catch (e) {
        console.error('Hope post fetch failed', e);
      }
    })();
  }, [pet?._id]);

  const displayPet = petData || pet || {
    id: '1',
    name: 'Puppy (Pet Name)',
    age: '6 Months Old',
    location: 'Pratap Nagar, Jaipur',
    image: '🐕',
    badge: 'New Listing',
    badgeColor: '#10B981',
  };

  const ownerData = displayPet.user
    ? {
        name: displayPet.user.name || 'User',
        phone: (displayPet.user as any).phone || '',
        profileImage: (displayPet.user as any).profileImage
          ? { uri: (displayPet.user as any).profileImage }
          : ownerIcon,
      }
    : {
        name: 'John Doe',
        phone: '123456XXXX',
        profileImage: ownerIcon,
      };

  const petDescription = displayPet.description && displayPet.description.trim()
    ? displayPet.description
    : 'No description provided.';

  const handleCall = () => {
    // Logic to make phone call
  };

  const handleChat = () => {
    (navigation as any).navigate('HopeChat' as never, {
      name: ownerData.name,
      postId: displayPet._id,
    } as never);
  };

  const getActionButton = () => {
    if (displayPet.badge === 'Adopt Now' || displayPet.status === 'adoption') {
      return (
        <View style={styles.actionRow}>
          <View style={styles.statusPillPurple}>
            <Text style={styles.statusPillText}>Adoption</Text>
          </View>
          <TouchableOpacity style={styles.primaryAction} onPress={handleCall}>
            <Text style={styles.primaryActionText}>Adopt</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.actionRow}>
        <View style={styles.statusPillGreen}>
          <Text style={styles.statusPillText}>New Listing</Text>
        </View>
        <TouchableOpacity style={styles.primaryAction} onPress={handleCall}>
          <Text style={styles.primaryActionText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={leftArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayPet.name}</Text>
        <View style={styles.moreContainer}>
        <TouchableOpacity onPress={() => setShowOptions(true)}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Image(s): first image or emoji; multiple images as horizontal strip */}
        <View style={styles.petImageContainer}>
          {typeof displayPet.image === 'string' && (displayPet.image.startsWith('http') || displayPet.image.startsWith('data:')) ? (
            <Image source={{ uri: displayPet.image }} style={styles.petImageEmoji} resizeMode="cover" />
          ) : typeof displayPet.image === 'string' ? (
            <Text style={styles.petImageEmojiText}>{displayPet.image}</Text>
          ) : (
            <Image source={displayPet.image} style={styles.petImageEmoji} resizeMode="cover" />
          )}
        </View>
        {(petData as any).images && (petData as any).images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesStrip}
          >
            {((petData as any).images as string[]).map((uri: string, idx: number) => (
              <TouchableOpacity key={idx} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Pet Information */}
        <View style={styles.section}>
          <View style={styles.petHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{displayPet.name}</Text>
              <Text style={styles.petAge}>{displayPet.age}</Text>
              <Text style={styles.petLocation}>{displayPet.location}</Text>
            </View>

            {/* Adoption Badge */}
            <View style={[styles.adoptionBadge, { backgroundColor: displayPet.badgeColor }]}>
              <Text style={styles.adoptionText}>{displayPet.badge}</Text>
            </View>
          </View>
        </View>

        {/* Owner Information */}
        <View style={styles.section}>
          <View style={styles.ownerRow}>
            <View style={styles.ownerLeft}>
              <View style={styles.ownerProfileContainer}>
                <Image source={ownerData.profileImage} style={{ width: '100%', height: '100%' }} />
              </View>

              <View>
                <Text style={styles.ownerName}>{ownerData.name}</Text>
                <Text style={styles.ownerPhone}>{ownerData.phone}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.chatNowButton} onPress={handleChat}>
              <Text style={styles.chatNowText}>Chat Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Details</Text>
          <Text style={styles.petDescription}>{petDescription}</Text>
        </View>
      </ScrollView>

      {/* Options Bottom Sheet */}
      <Modal
        transparent
        animationType="slide"
        visible={showOptions}
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Options</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.sheetActionsRow}>
              {/* Mark as Completed */}
              <TouchableOpacity style={styles.actionItem}
              onPress={() => {
                  setShowOptions(false);
                  setShowReportDone(true);
                  setTimeout(() => setShowReportDone(false), 1600);
                }}
              >
                <View style={styles.actionCircle}>
                  <Image source={adoptionCompleteIcon} style={styles.actionIcon}/>
                </View>
                <Text style={styles.actionText}>
                  Mark as Adoption{'\n'}Completed
                </Text>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity style={styles.actionItem} onPress={() => setShowDeleteModal(true)}>
                <View style={[styles.actionCircle, styles.deleteCircle]}>
                  <Image source={deleteIcon} style={styles.actionIcon}/>
                </View>
                <Text style={styles.actionText}>Delete Post</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Report Done */}
      <Modal transparent animationType="fade" visible={showReportDone}>
        <View style={styles.reportOverlay}>
          <View style={styles.reportCard}>
            <View style={styles.reportTick}>
              <Text style={styles.reportTickText}>✓</Text>
            </View>
            <Text style={styles.reportSub}>
              Thank you for marking it as Adoption Completed. shortly.
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        transparent
        animationType="slide"
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteOverlay}>
          {/* Tap outside to close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowDeleteModal(false)}
          />

          {/* Sheet */}
          <View style={styles.deleteSheet}>
            {/* Header */}
            <View style={styles.deleteHeader}>
              <View style={styles.deleteIconCircle}>
                <Image source={deleteIcon2} style={styles.actionIcon}/>
              </View>

              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <Text style={styles.deleteTitle}>Delete Post</Text>
            <Text style={styles.deleteDesc}>
              Are you sure, you want to delete this post?
            </Text>

            {/* Actions */}
            <View style={styles.deleteActions}>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => {
                  setShowDeleteModal(false);
                  // 👉 CALL DELETE API HERE
                }}
              >
                <Text style={styles.confirmText}>Yes, Delete</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backIcon: {
    height:30,
    width:30,
    marginRight:10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  moreContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
    gap: 4,
  },
  moreIcon: {
    fontSize: 26,
    color: '#111827',
    fontWeight: '800',
    paddingHorizontal: 6,
  },
  petImageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImageEmoji: {
    height:'100%',
    width:'100%',
    resizeMode:'cover',
  },
  petImageEmojiText: {
    fontSize: 120,
  },
  imagesStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  section: {
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#D9DCE2',
},

/* Pet Header */
petHeaderRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
},

petName: {
  fontSize: 18,
  fontWeight: '600',
  color: '#111827',
  marginBottom: 4,
},

petAge: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 4,
},

petLocation: {
  fontSize: 14,
  color: '#6B7280',
},

adoptionBadge: {
  backgroundColor: '#A3E635',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
},

adoptionText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#ffffff',
},

/* Owner Section */
ownerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

ownerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},

ownerProfileContainer: {
  width: 47,
  height: 47,
  borderRadius: 30,
  overflow: 'hidden',
},

ownerProfileEmoji: {
  fontSize: 32,
},

ownerName: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111827',
},

ownerPhone: {
  fontSize: 12,
  color: '#6B7280',
},

chatNowButton: {
  backgroundColor: '#1F2E46',
  paddingHorizontal: 16,
  paddingVertical: 16,
  borderRadius: 30,
},

chatNowText: {
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: '600',
},

sectionTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#111827',
  marginBottom: 8,
},

petDescription: {
  fontSize: 13,
  color: '#4B5563',
  lineHeight: 20,
},
  outlineButton: {
    width: 90,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusPillGreen: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#10B981',
  },
  statusPillPurple: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sheetOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'flex-end',
  paddingBottom: 0,
},

sheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 30,
  marginBottom: 0,
},

sheetHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
},

sheetTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
},

sheetClose: {
  fontSize: 20,
  color: '#111827',
  borderWidth:2,
  borderRadius:30,
  paddingVertical:2,
  paddingHorizontal:6,
},

sheetActionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  alignItems: 'center',
},

actionItem: {
  alignItems: 'center',
  width: 140,
},

actionCircle: {
  width: 60,
  height: 60,
  borderRadius: 32,
  borderWidth: 2,
  borderColor: '#111827',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 10,
},

deleteCircle: {
  borderColor: '#EF4444',
},

actionIcon: {
  height:30,
  width:30,
  resizeMode:'contain'
},

deleteIcon: {
  fontSize: 22,
},

actionText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#111827',
  textAlign: 'center',
  lineHeight: 18,
},
  reportOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    alignContent:'flex-start'
  },
  reportCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  reportTick: {
    width: 40,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#95E562',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reportTickText: { color: '#000000', fontSize: 22, fontWeight: '900' },
  reportTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  reportSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  deleteOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.35)',
  justifyContent: 'flex-end',
},

deleteSheet: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 28,
},

deleteHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 14,
},

deleteIconCircle: {
  width: 50,
  height: 50,
  borderRadius: 30,
  backgroundColor: '#FF5A4F',
  alignItems: 'center',
  justifyContent: 'center',
},

closeIcon: {
  fontSize: 20,
  color: '#111827',
  borderWidth:2,
  borderRadius:30,
  paddingVertical:2,
  paddingHorizontal:7,
},

deleteTitle: {
  fontSize: 17,
  fontWeight: '800',
  color: '#000000',
  marginBottom: 6,
},

deleteDesc: {
  fontSize: 14,
  color: '#000000',
  lineHeight: 20,
  marginBottom: 22,
},

deleteActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

cancelText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#000000',
},

confirmBtn: {
  backgroundColor: '#1F2E46',
  paddingHorizontal: 40,
  paddingVertical: 15,
  borderRadius: 999,
},

confirmText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},
});

export default HopeDetailScreen;

