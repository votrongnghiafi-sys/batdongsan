/**
 * V6: Section Templates — schema-driven section definitions.
 *
 * Each template defines:
 * - type: unique section type key
 * - label: display name for the builder UI
 * - icon: emoji for visual identification
 * - category: grouping for sidebar display ('content' | 'widget' | 'utility')
 * - maxInstances: max allowed instances (0 = unlimited)
 * - defaultConfig: initial config when creating a new instance
 * - schema: field definitions for dynamic form generation
 * - isFeature: if true, this section maps to a legacy features toggle
 */

export type SectionCategory = 'content' | 'widget' | 'utility';

export interface SectionFieldSchema {
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'image' | 'color' | 'list';
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface SectionTemplate {
  type: string;
  label: string;
  icon: string;
  category: SectionCategory;
  maxInstances: number;
  defaultConfig: Record<string, unknown>;
  schema: Record<string, SectionFieldSchema>;
  isFeature?: boolean;
}

// ---------------------------------------------------------------
// Category labels for sidebar grouping
// ---------------------------------------------------------------
export const SECTION_CATEGORY_LABELS: Record<SectionCategory, string> = {
  content: 'Nội dung',
  widget: 'Widget',
  utility: 'Tiện ích',
};

// ---------------------------------------------------------------
// Feature key ↔ section type mapping (for backward compat)
// ---------------------------------------------------------------
export const FEATURE_KEY_TO_SECTION: Record<string, string> = {
  leadForm: 'lead-form',
  gallery: 'gallery',
  propertyFilter: 'property-filter',
  map: 'map',
  chatbot: 'chatbot',
  booking: 'booking',
  aiAnalysis: 'ai-analysis',
};

export const SECTION_TO_FEATURE_KEY: Record<string, string> = {
  'lead-form': 'leadForm',
  'gallery': 'gallery',
  'property-filter': 'propertyFilter',
  'map': 'map',
  'chatbot': 'chatbot',
  'booking': 'booking',
  'ai-analysis': 'aiAnalysis',
};

// ---------------------------------------------------------------
// Section Templates
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// V7: Shared Background Schema (injected into content/widget sections)
// ---------------------------------------------------------------
const BACKGROUND_SCHEMA: Record<string, SectionFieldSchema> = {
  backgroundImage: { type: 'image',  label: 'Ảnh nền' },
  backgroundColor: { type: 'color',  label: 'Màu nền', placeholder: '#1a1a2e' },
};

const BACKGROUND_DEFAULTS: Record<string, unknown> = {
  backgroundImage: '',
  backgroundColor: '',
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  // --- Content sections ---
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: '🖼️',
    category: 'content',
    maxInstances: 1,
    defaultConfig: {
      enabled: true,
      title: '',
      subtitle: '',
      ...BACKGROUND_DEFAULTS,
      // Status badge
      status: 'selling',
      // Location
      location: '',
      // CTA buttons
      ctaText: 'Liên hệ tư vấn',
      ctaLink: '#section-contact',
      ctaPhone: '',
      // Stats cards
      stat1Value: '100+', stat1Label: 'Căn hộ',
      stat2Value: '5★',   stat2Label: 'Tiện ích',
      stat3Value: '24/7',  stat3Label: 'An ninh',
    },
    schema: {
      title:           { type: 'text',     label: 'Tiêu đề',       placeholder: 'Dự Án ABC' },
      subtitle:        { type: 'text',     label: 'Phụ đề',        placeholder: 'Không gian sống đẳng cấp' },
      ...BACKGROUND_SCHEMA,
      status:          { type: 'select',   label: 'Trạng thái',    options: [
        { value: 'selling',   label: 'Đang mở bán' },
        { value: 'upcoming',  label: 'Sắp ra mắt' },
        { value: 'sold_out',  label: 'Đã bán hết' },
      ]},
      location:        { type: 'text',     label: 'Vị trí',        placeholder: 'Quận 2, TP.HCM' },
      ctaText:         { type: 'text',     label: 'Nút CTA chính', placeholder: 'Đăng ký tư vấn' },
      ctaLink:         { type: 'text',     label: 'Link CTA',      placeholder: '#section-contact' },
      ctaPhone:        { type: 'text',     label: 'Số điện thoại CTA', placeholder: '0909 123 456' },
      stat1Value:      { type: 'text',     label: 'Stat 1 — Giá trị', placeholder: '100+' },
      stat1Label:      { type: 'text',     label: 'Stat 1 — Nhãn',    placeholder: 'Căn hộ' },
      stat2Value:      { type: 'text',     label: 'Stat 2 — Giá trị', placeholder: '5★' },
      stat2Label:      { type: 'text',     label: 'Stat 2 — Nhãn',    placeholder: 'Tiện ích' },
      stat3Value:      { type: 'text',     label: 'Stat 3 — Giá trị', placeholder: '24/7' },
      stat3Label:      { type: 'text',     label: 'Stat 3 — Nhãn',    placeholder: 'An ninh' },
    },
  },
  {
    type: 'about',
    label: 'Giới thiệu',
    icon: '📖',
    category: 'content',
    maxInstances: 2,
    defaultConfig: {
      enabled: true,
      title: 'Về dự án',
      description: '',
      highlights: [],
      ...BACKGROUND_DEFAULTS,
    },
    schema: {
      title:       { type: 'text',     label: 'Tiêu đề',   placeholder: 'Về dự án' },
      description: { type: 'textarea', label: 'Mô tả',     placeholder: 'Giới thiệu về dự án...' },
      highlights:  { type: 'list',     label: 'Điểm nổi bật', placeholder: 'VD: Vị trí vàng Quận 2' },
      ...BACKGROUND_SCHEMA,
    },
  },
  {
    type: 'property-list',
    label: 'Danh sách BĐS',
    icon: '🏠',
    category: 'content',
    maxInstances: 1,
    defaultConfig: {
      enabled: true,
      limit: 6,
      sort: 'price_desc',
      showFeaturedOnly: false,
      ...BACKGROUND_DEFAULTS,
    },
    schema: {
      limit:            { type: 'number', label: 'Số BĐS hiển thị', min: 1, max: 50 },
      sort:             { type: 'select', label: 'Sắp xếp', options: [
        { value: 'price_desc', label: 'Giá cao → thấp' },
        { value: 'price_asc',  label: 'Giá thấp → cao' },
        { value: 'newest',     label: 'Mới nhất' },
      ]},
      showFeaturedOnly: { type: 'toggle', label: 'Chỉ hiện BĐS nổi bật' },
      ...BACKGROUND_SCHEMA,
    },
  },
  {
    type: 'amenities',
    label: 'Tiện ích dự án',
    icon: '⭐',
    category: 'content',
    maxInstances: 1,
    defaultConfig: { enabled: true, ...BACKGROUND_DEFAULTS },
    schema: { ...BACKGROUND_SCHEMA },
  },
  {
    type: 'gallery',
    label: 'Thư viện ảnh',
    icon: '📸',
    category: 'content',
    maxInstances: 2,
    defaultConfig: {
      enabled: true,
      layout: 'grid',
      ...BACKGROUND_DEFAULTS,
    },
    schema: {
      layout: { type: 'select', label: 'Kiểu hiển thị', options: [
        { value: 'grid',     label: 'Lưới' },
        { value: 'masonry',  label: 'Masonry' },
        { value: 'carousel', label: 'Carousel' },
      ]},
      ...BACKGROUND_SCHEMA,
    },
    isFeature: true,
  },
  {
    type: 'location',
    label: 'Vị trí',
    icon: '📍',
    category: 'content',
    maxInstances: 1,
    defaultConfig: { enabled: true, ...BACKGROUND_DEFAULTS },
    schema: { ...BACKGROUND_SCHEMA },
  },
  {
    type: 'lead-form',
    label: 'Form liên hệ',
    icon: '✉️',
    category: 'content',
    maxInstances: 1,
    defaultConfig: { enabled: true, ...BACKGROUND_DEFAULTS },
    schema: { ...BACKGROUND_SCHEMA },
    isFeature: true,
  },

  // --- Widget sections (previously in Features tab) ---
  {
    type: 'property-filter',
    label: 'Bộ lọc BĐS',
    icon: '🔎',
    category: 'widget',
    maxInstances: 1,
    defaultConfig: { enabled: true, ...BACKGROUND_DEFAULTS },
    schema: { ...BACKGROUND_SCHEMA },
    isFeature: true,
  },
  {
    type: 'map',
    label: 'Bản đồ',
    icon: '🗺️',
    category: 'widget',
    maxInstances: 1,
    defaultConfig: { enabled: true, ...BACKGROUND_DEFAULTS },
    schema: { ...BACKGROUND_SCHEMA },
    isFeature: true,
  },

  // --- Utility sections (no background needed) ---
  {
    type: 'chatbot',
    label: 'Chatbot',
    icon: '🤖',
    category: 'utility',
    maxInstances: 1,
    defaultConfig: { enabled: false },
    schema: {},
    isFeature: true,
  },
  {
    type: 'booking',
    label: 'Đặt lịch',
    icon: '📅',
    category: 'utility',
    maxInstances: 1,
    defaultConfig: { enabled: false },
    schema: {},
    isFeature: true,
  },
  {
    type: 'ai-analysis',
    label: 'AI Analysis',
    icon: '🧠',
    category: 'utility',
    maxInstances: 1,
    defaultConfig: { enabled: false },
    schema: {},
    isFeature: true,
  },
];

/** Quick lookup by type */
export const SECTION_TEMPLATE_MAP = new Map<string, SectionTemplate>(
  SECTION_TEMPLATES.map(t => [t.type, t])
);

/** Get templates grouped by category */
export function getTemplatesByCategory(): Map<SectionCategory, SectionTemplate[]> {
  const result = new Map<SectionCategory, SectionTemplate[]>();
  for (const t of SECTION_TEMPLATES) {
    const list = result.get(t.category) || [];
    list.push(t);
    result.set(t.category, list);
  }
  return result;
}
