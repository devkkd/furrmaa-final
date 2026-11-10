/**
 * Haptics disabled by default — Vibration without android.permission.VIBRATE
 * hard-crashes the app process on many Android builds (tab press / cart confirm).
 * Keep these as safe no-ops so UI never depends on the vibrator.
 */
export function hapticLight() {
  // no-op (stable)
}

export function hapticMedium() {
  // no-op (stable)
}

export function hapticSuccess() {
  // no-op (stable)
}
