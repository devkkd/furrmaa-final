/**
 * Shared icon sizes for consistent visual weight across the app.
 * Prefer these over one-off fontSize / width values for icons.
 */
export const ICON_SIZES = {
  /** Header back / navigation arrows */
  back: 28,
  /** Primary header / toolbar actions */
  action: 24,
  /** Tab bar icons (sits inside focused pill) */
  tab: 30,
  /** +/- inside quantity circles */
  qty: 18,
  /** Inline arrows next to button labels */
  inline: 18,
  /** Close / remove (✕) marks */
  close: 16,
  /** Small list / row chevrons */
  chevron: 20,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZES;
