import { Platform, Vibration } from 'react-native';

/**
 * Light haptic / vibration — no extra native module required.
 * Used on tab presses, primary buttons, confirm actions.
 */
export function hapticLight() {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(12);
    } else {
      // iOS: short vibration pattern (best-effort without extra deps)
      Vibration.vibrate(10);
    }
  } catch {
    // ignore devices without vibrator
  }
}

export function hapticMedium() {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(25);
    } else {
      Vibration.vibrate(20);
    }
  } catch {
    // ignore
  }
}

export function hapticSuccess() {
  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 12, 40, 12]);
    } else {
      Vibration.vibrate(15);
    }
  } catch {
    // ignore
  }
}
