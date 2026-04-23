/**
 * Utility functions — Vietnamese formatting, icons, helpers
 */

/** Format Vietnamese Dong (VND) */
export function formatPrice(value: number | string | null | undefined): string {
  if (!value) return '—';
  const num = Number(value);
  if (isNaN(num)) return '—';
  if (num >= 1_000_000_000) {
    const b = num / 1_000_000_000;
    return `${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)} tỷ`;
  }
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)} triệu`;
  }
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

/** Format area in m² */
export function formatArea(value: number | string | null | undefined): string {
  if (!value) return '—';
  return `${Number(value).toFixed(0)} m²`;
}

/** Emoji icons for amenities */
export const AMENITY_ICONS: Record<string, string> = {
  pool: '🏊',
  gym: '💪',
  park: '🌳',
  security: '🔒',
  school: '🎓',
  hospital: '🏥',
  shopping: '🛍️',
  playground: '🎮',
  cafe: '☕',
  restaurant: '🍽️',
  spa: '🧖',
  tennis: '🎾',
  parking: '🅿️',
};

/** Smooth scroll to element by ID */
export function scrollToSection(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
