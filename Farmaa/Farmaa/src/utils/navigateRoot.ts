/**
 * Navigate to a Stack screen from a nested Tab navigator.
 * Avoids unhandled NAVIGATE actions that crash / redbox on tab screens.
 */
export function navigateRoot(
  navigation: { getParent?: () => any; navigate: (...args: any[]) => void },
  screenName: string,
  params?: Record<string, unknown>
) {
  try {
    const parent = navigation.getParent?.();
    if (parent?.navigate) {
      parent.navigate(screenName, params);
      return;
    }
  } catch {
    // fall through
  }
  try {
    navigation.navigate(screenName, params);
  } catch (e) {
    console.warn('navigateRoot failed', screenName, e);
  }
}

export function safeGoBack(navigation: {
  canGoBack?: () => boolean;
  goBack: () => void;
}) {
  try {
    if (navigation.canGoBack && !navigation.canGoBack()) return;
    navigation.goBack();
  } catch {
    // ignore
  }
}
