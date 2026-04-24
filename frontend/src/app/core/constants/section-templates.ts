/**
 * V5: Section Templates — schema-driven section definitions.
 *
 * Each template defines:
 * - type: unique section type key
 * - label: display name for the builder UI
 * - icon: emoji for visual identification
 * - maxInstances: max allowed instances (0 = unlimited)
 * - defaultConfig: initial config when creating a new instance
 * - schema: field definitions for dynamic form generation
 */

export interface SectionFieldSchema {
  type: 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'image' | 'color';
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
  maxInstances: number;
  defaultConfig: Record<string, unknown>;
  schema: Record<string, SectionFieldSchema>;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: '🖼️',
    maxInstances: 1,
    defaultConfig: {
      enabled: true,
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: 'Liên hệ tư vấn',
      ctaLink: '#section-contact',
    },
    schema: {
      title:           { type: 'text',     label: 'Tiêu đề',    placeholder: 'Dự án ABC' },
      subtitle:        { type: 'text',     label: 'Phụ đề',     placeholder: 'Không gian sống đẳng cấp' },
      backgroundImage: { type: 'image',    label: 'Ảnh nền' },
      ctaText:         { type: 'text',     label: 'Nút CTA',    placeholder: 'Xem bảng giá' },
      ctaLink:         { type: 'text',     label: 'Link CTA',   placeholder: '#section-contact' },
    },
  },
  {
    type: 'about',
    label: 'Giới thiệu',
    icon: '📖',
    maxInstances: 2,
    defaultConfig: {
      enabled: true,
      title: 'Về dự án',
      description: '',
    },
    schema: {
      title:       { type: 'text',     label: 'Tiêu đề',   placeholder: 'Về dự án' },
      description: { type: 'textarea', label: 'Mô tả',     placeholder: 'Giới thiệu về dự án...' },
    },
  },
  {
    type: 'property-list',
    label: 'Danh sách BĐS',
    icon: '🏠',
    maxInstances: 1,
    defaultConfig: {
      enabled: true,
      limit: 6,
      sort: 'price_desc',
      showFeaturedOnly: false,
    },
    schema: {
      limit:            { type: 'number', label: 'Số BĐS hiển thị', min: 1, max: 50 },
      sort:             { type: 'select', label: 'Sắp xếp', options: [
        { value: 'price_desc', label: 'Giá cao → thấp' },
        { value: 'price_asc',  label: 'Giá thấp → cao' },
        { value: 'newest',     label: 'Mới nhất' },
      ]},
      showFeaturedOnly: { type: 'toggle', label: 'Chỉ hiện BĐS nổi bật' },
    },
  },
  {
    type: 'amenities',
    label: 'Tiện ích',
    icon: '⭐',
    maxInstances: 1,
    defaultConfig: { enabled: true },
    schema: {},
  },
  {
    type: 'gallery',
    label: 'Thư viện ảnh',
    icon: '📸',
    maxInstances: 2,
    defaultConfig: {
      enabled: true,
      layout: 'grid',
    },
    schema: {
      layout: { type: 'select', label: 'Kiểu hiển thị', options: [
        { value: 'grid',     label: 'Lưới' },
        { value: 'masonry',  label: 'Masonry' },
        { value: 'carousel', label: 'Carousel' },
      ]},
    },
  },
  {
    type: 'location',
    label: 'Vị trí',
    icon: '📍',
    maxInstances: 1,
    defaultConfig: { enabled: true },
    schema: {},
  },
  {
    type: 'lead-form',
    label: 'Form liên hệ',
    icon: '✉️',
    maxInstances: 1,
    defaultConfig: { enabled: true },
    schema: {},
  },
];

/** Quick lookup by type */
export const SECTION_TEMPLATE_MAP = new Map<string, SectionTemplate>(
  SECTION_TEMPLATES.map(t => [t.type, t])
);
