/**
 * Predefined theme presets for quick selection.
 * These are applied via patchValue() — no form structure changes.
 */
export interface ThemePreset {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'Corporate Blue',  primary: '#2563EB', secondary: '#1E293B', background: '#F8FAFC', text: '#0F172A', accent: '#38BDF8' },
  { name: 'Luxury Green',    primary: '#065F46', secondary: '#064E3B', background: '#ECFDF5', text: '#022C22', accent: '#10B981' },
  { name: 'Gold Premium',    primary: '#C9A227', secondary: '#1F2937', background: '#FFFBEB', text: '#111827', accent: '#FBBF24' },
  { name: 'Sales Red',       primary: '#DC2626', secondary: '#7F1D1D', background: '#FEF2F2', text: '#1F2937', accent: '#F87171' },
  { name: 'Dark Luxury',     primary: '#111827', secondary: '#374151', background: '#030712', text: '#F9FAFB', accent: '#F59E0B' },
  { name: 'Modern Purple',   primary: '#7C3AED', secondary: '#4C1D95', background: '#F5F3FF', text: '#1E1B4B', accent: '#A78BFA' },
  { name: 'Ocean Blue',      primary: '#0284C7', secondary: '#0369A1', background: '#F0F9FF', text: '#082F49', accent: '#38BDF8' },
  { name: 'Earth Brown',     primary: '#92400E', secondary: '#78350F', background: '#FFFBEB', text: '#451A03', accent: '#F59E0B' },
  { name: 'Sunset Orange',   primary: '#F97316', secondary: '#9A3412', background: '#FFF7ED', text: '#431407', accent: '#FB923C' },
  { name: 'Fresh Minimal',   primary: '#22C55E', secondary: '#14532D', background: '#F0FDF4', text: '#052E16', accent: '#4ADE80' },
  { name: 'Mono Clean',      primary: '#111111', secondary: '#444444', background: '#FFFFFF', text: '#000000', accent: '#888888' },
  { name: 'Tech Blue',       primary: '#0EA5E9', secondary: '#1E40AF', background: '#F0F9FF', text: '#0C4A6E', accent: '#38BDF8' },
];
