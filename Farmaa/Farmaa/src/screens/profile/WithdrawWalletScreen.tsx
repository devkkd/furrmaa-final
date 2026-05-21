import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/** Legacy route — withdraw is on WalletScreen */
const WithdrawWalletScreen = () => {
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

export default WithdrawWalletScreen;