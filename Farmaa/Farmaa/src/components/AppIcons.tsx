import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import leftArrow from '../assets/images/arrow-left.png';
import { ICON_SIZES } from '../constants/iconSizes';

type SizeProps = {
  size?: number;
  color?: string;
};

type BackIconProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** Header back arrow — uses the app asset so stroke weight matches other screens. */
export function BackIcon({ size = ICON_SIZES.back, style }: BackIconProps) {
  return (
    <Image
      source={leftArrow}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

export function MinusIcon({ size = ICON_SIZES.qty, color = '#1F2937' }: SizeProps) {
  return <MaterialCommunityIcons name="minus" size={size} color={color} />;
}

export function PlusIcon({ size = ICON_SIZES.qty, color = '#1F2937' }: SizeProps) {
  return <MaterialCommunityIcons name="plus" size={size} color={color} />;
}

export function ArrowRightIcon({
  size = ICON_SIZES.inline,
  color = '#FFFFFF',
}: SizeProps) {
  return <MaterialCommunityIcons name="arrow-right" size={size} color={color} />;
}

export function CloseIcon({ size = ICON_SIZES.close, color = '#6B7280' }: SizeProps) {
  return <MaterialCommunityIcons name="close" size={size} color={color} />;
}
