import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

// @ts-ignore
import dogHero from '../assets/images/training/petcard-dog-hero.png';
// @ts-ignore
import dogVideo from '../assets/images/training/petcard-dog-video.png';
// @ts-ignore
import dogTrainer from '../assets/images/training/petcard-dog-trainer.png';
// @ts-ignore
import catHero from '../assets/images/training/petcard-cat-hero.png';
// @ts-ignore
import catVideo from '../assets/images/training/petcard-cat-video.png';
// @ts-ignore
import catTrainer from '../assets/images/training/petcard-cat-trainer.png';

const { width } = Dimensions.get('window');
const PAD = 16;
const CARD_W = width - PAD * 2;

type Props = {
  petType: 'dog' | 'cat';
  onOpenTraining: () => void;
};

const CONTENT = {
  dog: {
    sectionTitle: 'Dog Training',
    sectionSub: 'Start where your dog feels comfortable',
    basicTitle: 'Basic Training',
    basicDesc: "Your best buddy's first step towards social obedience.",
    tags: ['Puppy', 'Dog', 'View More Details'],
    cta: "Let's Start →",
    basicsLabel: 'Dog Basics',
    heroImg: dogHero,
    videoImg: dogVideo,
    trainerTitle: 'Hire a Personal Dog Trainer',
    trainerDesc:
      'Personalized, one-on-one training in your home. Positive methods. Real results.',
    trainerImg: dogTrainer,
    bookCta: 'Book Session Today →',
  },
  cat: {
    sectionTitle: 'Cat Training',
    sectionSub: 'Start where your cat feels comfortable',
    basicTitle: 'Basic Cat Training',
    basicDesc: 'Gentle habits, litter confidence, and bonding — made simple for cats.',
    tags: ['Kitten', 'Cat', 'View More Details'],
    cta: "Let's Start →",
    basicsLabel: 'Cat Basics',
    heroImg: catHero,
    videoImg: catVideo,
    trainerTitle: 'Hire a Personal Cat Trainer',
    trainerDesc:
      'Calm, cat-friendly coaching at home. Build trust and better routines together.',
    trainerImg: catTrainer,
    bookCta: 'Book Session Today →',
  },
} as const;

/** Website PetCard section — same copy + art, stacked for mobile. */
export default function HomeTrainingSection({ petType, onOpenTraining }: Props) {
  const c = CONTENT[petType === 'cat' ? 'cat' : 'dog'];

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>{c.sectionTitle}</Text>
      <Text style={styles.sectionSub}>{c.sectionSub}</Text>

      {/* Basic Training card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onOpenTraining}
        style={styles.basicCard}
      >
        <View style={styles.basicTop}>
          <View style={styles.basicLeft}>
            <View style={styles.titleRow}>
              <Text style={styles.basicTitle}>{c.basicTitle}</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>Free</Text>
              </View>
            </View>
            <Text style={styles.basicDesc}>{c.basicDesc}</Text>
            <View style={styles.tagsRow}>
              {c.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.cta}>{c.cta}</Text>
          </View>
          <Image source={c.heroImg} style={styles.heroImg} resizeMode="contain" />
        </View>

        <View style={styles.videoBlock}>
          <Image source={c.videoImg} style={styles.videoImg} resizeMode="cover" />
          <View style={styles.videoMeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.basicsLabel}>{c.basicsLabel}</Text>
              <Text style={styles.basicsMeta}>1 Lesson | 1 Day | 4:56 Min</Text>
            </View>
            <View style={styles.playBtn}>
              <View style={styles.playDot}>
                <View style={styles.playTriangle} />
              </View>
              <Text style={styles.playText}>Play</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Hire trainer card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onOpenTraining}
        style={styles.trainerCard}
      >
        <View style={styles.trainerCopy}>
          <Text style={styles.trainerTitle}>{c.trainerTitle}</Text>
          <Text style={styles.trainerDesc}>{c.trainerDesc}</Text>
          <View style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>{c.bookCta}</Text>
          </View>
        </View>
        <Image source={c.trainerImg} style={styles.trainerImg} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PAD,
    marginBottom: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 14,
  },
  basicCard: {
    width: CARD_W,
    borderRadius: 22,
    backgroundColor: '#FFE5B4',
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  basicTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  basicLeft: {
    flex: 1,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  basicTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  freeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  freeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  basicDesc: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.75)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  cta: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  heroImg: {
    width: 88,
    height: 100,
  },
  videoBlock: {
    marginTop: 4,
  },
  videoImg: {
    width: '100%',
    height: Math.round(CARD_W * 0.42),
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  basicsLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  basicsMeta: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2E46',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 8,
  },
  playDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderStyle: 'solid',
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#1F2E46',
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  trainerCard: {
    width: CARD_W,
    minHeight: 200,
    borderRadius: 22,
    backgroundColor: '#C0DBFF',
    padding: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  trainerCopy: {
    maxWidth: '62%',
    zIndex: 2,
  },
  trainerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  trainerDesc: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 16,
  },
  bookBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2E46',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  trainerImg: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    width: 130,
    height: 160,
  },
});
