import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { hapticLight, hapticMedium } from '../utils/haptics';

export type AppAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

type AlertPayload = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type AppAlertContextValue = {
  showAlert: (title: string, message?: string, buttons?: AppAlertButton[]) => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

let externalShow: AppAlertContextValue['showAlert'] | null = null;

/** Drop-in replacement for Alert.alert — themed to Furrmaa navy/green. */
export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[]
) {
  if (externalShow) {
    externalShow(title, message, buttons);
    return;
  }
  // Fallback if provider not mounted yet
  const { Alert } = require('react-native');
  Alert.alert(title, message, buttons);
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [payload, setPayload] = useState<AlertPayload>({ title: '' });

  const showAlert = useCallback((title: string, message?: string, buttons?: AppAlertButton[]) => {
    hapticLight();
    setPayload({
      title,
      message,
      buttons: buttons?.length
        ? buttons
        : [{ text: 'OK', style: 'default' }],
    });
    setVisible(true);
  }, []);

  externalShow = showAlert;

  const close = () => setVisible(false);

  const onButton = (btn: AppAlertButton) => {
    if (btn.style === 'destructive') hapticMedium();
    else hapticLight();
    close();
    // Defer so modal can close first
    setTimeout(() => btn.onPress?.(), 50);
  };

  const value = useMemo(() => ({ showAlert }), [showAlert]);
  const buttons = payload.buttons || [{ text: 'OK', style: 'default' as const }];

  return (
    <AppAlertContext.Provider value={value}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{payload.title}</Text>
            {payload.message ? (
              <Text style={styles.message}>{payload.message}</Text>
            ) : null}
            <View style={styles.actions}>
              {buttons.map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isPrimary = !isCancel && !isDestructive && buttons.length === 1
                  ? true
                  : !isCancel && (isDestructive || i === buttons.length - 1);
                return (
                  <TouchableOpacity
                    key={`${btn.text}-${i}`}
                    style={[
                      styles.btn,
                      isCancel && styles.btnCancel,
                      isPrimary && !isDestructive && styles.btnPrimary,
                      isDestructive && styles.btnDestructive,
                    ]}
                    onPress={() => onButton(btn)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isCancel && styles.btnTextCancel,
                        isPrimary && !isDestructive && styles.btnTextPrimary,
                        isDestructive && styles.btnTextDestructive,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AppAlertContext);
  if (!ctx) {
    return { showAlert: showAppAlert };
  }
  return ctx;
}

const NAVY = '#1F2E46';
const GREEN = '#95E562';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 46, 70, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  btnCancel: {
    backgroundColor: '#F3F4F6',
  },
  btnPrimary: {
    backgroundColor: NAVY,
  },
  btnDestructive: {
    backgroundColor: NAVY,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  btnTextCancel: {
    color: '#6B7280',
  },
  btnTextPrimary: {
    color: '#FFFFFF',
  },
  btnTextDestructive: {
    color: GREEN,
  },
});
