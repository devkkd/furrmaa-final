import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import googleIcon from '../assets/images/google_icon.png'

type Props = {
  size?: number;
};

/** FontAwesome5 brand glyph — Google red; Apple icon ke saath size 24 default */
export default function GoogleBrandIcon({ size = 24 }: Props) {
  return (
    <View style={[styles.wrap, { width: size + 10, height: size + 2 }]}>
      <Image source={googleIcon} style={{ width: size, height: size, marginLeft: 5 }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
