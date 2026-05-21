import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/** Legacy route — wallet recharge is on WalletScreen */
const RechargeWalletScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.replace('Wallet' as never);
  }, [navigation]);

  return (
    <View style={styles.box}>
      <ActivityIndicator size="large" color="#1F2E46" />
    </View>
  );
};

const styles = StyleSheet.create({
  box: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
});

export default RechargeWalletScreen;