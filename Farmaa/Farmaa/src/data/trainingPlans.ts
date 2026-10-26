/**
 * Same training plan cards as website `/training` (useTrainingVideos programDefaults).
 */

// @ts-ignore
import dogBasic from '../assets/images/training/plan-dog-basic.png';
// @ts-ignore
import dogIntermediate from '../assets/images/training/plan-dog-intermediate.png';
// @ts-ignore
import dogAdvanced from '../assets/images/training/plan-dog-advanced.png';
// @ts-ignore
import catBasic from '../assets/images/training/plan-cat-basic.png';
// @ts-ignore
import catIntermediate from '../assets/images/training/plan-cat-intermediate.png';
// @ts-ignore
import catAdvanced from '../assets/images/training/plan-cat-advanced.png';

export type TrainingPlanKey = 'basic' | 'intermediate' | 'advanced';

export type TrainingPlanMeta = {
  program: TrainingPlanKey;
  title: string;
  description: string;
  isFree: boolean;
  image: number;
  /** Solid fill approximating website gradient */
  bgColor: string;
  textLight: boolean;
  tags: string[];
};

export function getTrainingPlanDefaults(petType: 'dog' | 'cat'): TrainingPlanMeta[] {
  const isCat = petType === 'cat';
  return [
    {
      program: 'basic',
      title: isCat ? 'Basic Cat Training' : 'Basic Dog Training',
      description: isCat
        ? 'Litter habits, calm cues, and bonding for cats & kittens.'
        : 'Foundation skills, simple commands, and bonding for dogs & puppies.',
      isFree: true,
      image: isCat ? catBasic : dogBasic,
      bgColor: '#FFD699',
      textLight: false,
      tags: isCat ? ['Kitten', 'Cat'] : ['Puppy', 'Dog'],
    },
    {
      program: 'intermediate',
      title: isCat ? 'Intermediate Cat Training' : 'Intermediate Dog Training',
      description: isCat
        ? 'Scratching, enrichment, and behavior shaping for cats.'
        : 'Discipline, behavior shaping, and everyday control for dogs.',
      isFree: false,
      image: isCat ? catIntermediate : dogIntermediate,
      bgColor: '#C9786C',
      textLight: true,
      tags: isCat ? ['Cat', 'Habits'] : ['Dog', 'Obedience'],
    },
    {
      program: 'advanced',
      title: isCat ? 'Advanced Cat Training' : 'Advanced Dog Training',
      description: isCat
        ? 'Advanced enrichment, clicker work, and confident routines.'
        : 'Master-level commands, agility, and obedience.',
      isFree: false,
      image: isCat ? catAdvanced : dogAdvanced,
      bgColor: '#5B59F0',
      textLight: true,
      tags: isCat ? ['Cat', 'Advanced'] : ['Dog', 'Advanced'],
    },
  ];
}
