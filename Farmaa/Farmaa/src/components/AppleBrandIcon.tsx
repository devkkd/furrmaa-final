import React from 'react';
import { StyleSheet, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Props = {
  /** Google icon ke saath same visual weight ke liye GoogleBrandIcon jaisa hi */
  size?: number;
};

/**
 * PNG hata diya — choti / gray box / scale issues.
 * GoogleBrandIcon ke saath same wrap + FontAwesome5 brand apple.
 */
export default function AppleBrandIcon({ size = 30 }: Props) {
  return (
    <View style={[styles.wrap, { width: size + 10, height: size + 2 }]}>
      <FontAwesome5 name="apple" brand size={size} color="#1D1D1F" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
