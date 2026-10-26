/**
 * Same banner set as website `Banner.jsx` — dog / cat slides with overlay copy.
 * Images: assets/images/banner/* (copied from web public/images/banner)
 */

// @ts-ignore
import dog01 from '../assets/images/banner/Dog-Banner-01.png';
// @ts-ignore
import dog02 from '../assets/images/banner/Dog-Banner-02.png';
// @ts-ignore
import dog05 from '../assets/images/banner/Dog-Banner-05.png';
// @ts-ignore
import dog07 from '../assets/images/banner/Dog-Banner-07.png';
// @ts-ignore
import dog10 from '../assets/images/banner/Dog-Banner-10.png';
// @ts-ignore
import dog11 from '../assets/images/banner/Dog-Banner-11.png';
// @ts-ignore
import dog12 from '../assets/images/banner/Dog-Banner-12.png';
// @ts-ignore
import cat02 from '../assets/images/banner/Cat-Banner-02.png';
// @ts-ignore
import cat03 from '../assets/images/banner/Cat-Banner-03.png';
// @ts-ignore
import cat04 from '../assets/images/banner/Cat-Banner-04.png';
// @ts-ignore
import cat05 from '../assets/images/banner/Cat-Banner-05.png';

export type HomeBanner = {
  id: string;
  image: number;
  title: string;
  heading: string;
  subHeading: string;
  description: string;
  button: string;
  /** Shop filter hint when tapping CTA */
  category?: string;
};

/** Banner art aspect ratio (website assets are 2560×900) */
export const BANNER_ASPECT = 2560 / 900;

export const DOG_HOME_BANNERS: HomeBanner[] = [
  {
    id: 'dog-01',
    image: dog01,
    title: 'Furrmaa Pet Care',
    heading: 'Everything Your Pet Needs.',
    subHeading: 'One Caring Platform.',
    description:
      'Smart pet care for dogs and cats. Shop essentials, train better, stay healthy and connect socially.',
    button: 'SHOP NOW →',
  },
  {
    id: 'dog-02',
    image: dog02,
    title: 'Furrmaa Dogs',
    heading: 'Premium Dog Food',
    subHeading: 'High Protein • Balanced Diet',
    description: 'Fuel your dog with high-quality and nutritious meals.',
    button: 'SHOP NOW →',
    category: 'food',
  },
  {
    id: 'dog-05',
    image: dog05,
    title: 'Furrmaa Dogs',
    heading: 'Dog Grooming Range',
    subHeading: 'Clean • Fresh • Safe',
    description: 'Keep your dog clean and fresh with safe grooming kits.',
    button: 'SHOP NOW →',
    category: 'grooming',
  },
  {
    id: 'dog-07',
    image: dog07,
    title: 'Furrmaa Dogs',
    heading: 'Comfortable Dog Beds',
    subHeading: 'Soft • Cozy • Durable',
    description: 'Give your dog the comfort they truly deserve.',
    button: 'SHOP NOW →',
    category: 'bedding',
  },
  {
    id: 'dog-10',
    image: dog10,
    title: 'Furrmaa Dogs',
    heading: 'Dog Training Essentials',
    subHeading: 'Smart • Effective • Easy',
    description: 'Train your dog with the right tools and techniques.',
    button: 'SHOP NOW →',
  },
  {
    id: 'dog-11',
    image: dog11,
    title: 'Furrmaa Dogs',
    heading: 'Travel with Dogs',
    subHeading: 'Safe • Easy • Comfortable',
    description: 'Make traveling with your dog smooth and stress-free.',
    button: 'SHOP NOW →',
    category: 'accessories',
  },
  {
    id: 'dog-12',
    image: dog12,
    title: 'Furrmaa Dogs',
    heading: 'Dog Feeding Essentials',
    subHeading: 'Bowls • Feeders • Storage',
    description: "Smart feeding solutions for your dog's daily routine.",
    button: 'SHOP NOW →',
    category: 'accessories',
  },
];

export const CAT_HOME_BANNERS: HomeBanner[] = [
  {
    id: 'cat-02',
    image: cat02,
    title: 'Furrmaa Cats',
    heading: 'Everything Your Cat Needs.',
    subHeading: 'One Caring Platform.',
    description: 'Premium care and essentials for your lovely cat.',
    button: 'SHOP NOW →',
  },
  {
    id: 'cat-03',
    image: cat03,
    title: 'Furrmaa Cats',
    heading: 'Cat Daily Essentials',
    subHeading: 'Litter • Toys • Care',
    description: 'All daily needs for your cat in one place.',
    button: 'SHOP NOW →',
  },
  {
    id: 'cat-04',
    image: cat04,
    title: 'Furrmaa Cats',
    heading: 'Cat Comfort Products',
    subHeading: 'Soft • Cozy • Relaxing',
    description: 'Give your cat the comfort they deserve.',
    button: 'SHOP NOW →',
    category: 'bedding',
  },
  {
    id: 'cat-05',
    image: cat05,
    title: 'Furrmaa Cats',
    heading: 'Fun Cat Toys',
    subHeading: 'Play • Engage • Enjoy',
    description: 'Keep your cat active and entertained all day.',
    button: 'SHOP NOW →',
    category: 'toys',
  },
];

export function getHomeBanners(petType: 'dog' | 'cat'): HomeBanner[] {
  return petType === 'cat' ? CAT_HOME_BANNERS : DOG_HOME_BANNERS;
}
