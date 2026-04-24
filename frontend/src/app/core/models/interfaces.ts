/**
 * Interfaces for the BDS multi-site system — V2 SaaS Architecture
 */

// ---------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------

export interface Site {
  id: number;
  site_key: string;
  name: string;
  domain: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string | null;
  email: string | null;
  is_active?: boolean;
}

export interface Project {
  id: number;
  site_id: number;
  name: string;
  location: string | null;
  description: string | null;
  hero_image: string | null;
  hero_tagline: string | null;
  status: 'upcoming' | 'selling' | 'sold_out';
}

export interface Property {
  id: number;
  project_id: number;
  title: string;
  price: number;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: string | null;
  direction: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  is_featured: boolean;
  status: 'available' | 'reserved' | 'sold';
  images: PropertyImage[];
}

export interface PropertyImage {
  url: string;
  altText: string | null;
}

// ---------------------------------------------------------------
// Config Groups (V2 SaaS)
// ---------------------------------------------------------------

export interface BrandingConfig {
  logoUrl: string;
  faviconUrl: string;
  siteName: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  // V3 semantic tokens
  presetId?: string;
  accentColor?: string;
  borderColor?: string;
  mutedColor?: string;
  borderRadius?: string;
}

export interface ContactConfig {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface FeaturesConfig {
  chatbot: boolean;
  aiAnalysis: boolean;
  booking: boolean;
  gallery: boolean;
  propertyFilter: boolean;
  leadForm: boolean;
  map: boolean;
  [key: string]: boolean; // allow dynamic flags
}

export interface LayoutConfig {
  homepage: string[];
}

// V4: Section-level config (page builder)
export interface SectionConfig {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  limit?: number;
  sort?: string;
  showFeaturedOnly?: boolean;
  layout?: string;
  [key: string]: unknown; // allow dynamic fields for future templates
}

export type SectionsConfigMap = Record<string, SectionConfig>;

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string;
  // V3
  canonicalUrl?: string;
  robots?: string;
  schemaJson?: Record<string, unknown>;
}

export interface LeadConfig {
  formTitle: string;
  formSubtitle: string;
  requiredFields: string[];
  enableHoneypot?: boolean;
  rateLimit?: number;
  notifyEmail?: string;
  // V3
  saveToDatabase?: boolean;
  autoAssign?: boolean;
  webhookUrl?: string;
  successMessage?: string;
}

export interface ProjectConfig {
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  showPrice: boolean;
  showArea: boolean;
  showStatus: boolean;
  priceUnit: string;
}

// ---------------------------------------------------------------
// Section Content Types
// ---------------------------------------------------------------

export interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaPhone: string;
}

export interface AboutContent {
  title: string;
  description: string;
  highlights: string[];
}

export interface GalleryContent {
  title: string;
  images: string[];
}

export interface AmenityItem {
  icon: string;
  name: string;
  description: string;
}

export interface AmenitiesContent {
  title: string;
  items: AmenityItem[];
}

export interface NearbyItem {
  name: string;
  distance: string;
}

export interface LocationContent {
  title: string;
  description: string;
  mapCenter: { lat: number; lng: number };
  nearby: NearbyItem[];
}

export interface ContactContent {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface SiteSections {
  hero?: HeroContent;
  about?: AboutContent;
  gallery?: GalleryContent;
  amenities?: AmenitiesContent;
  location?: LocationContent;
  contact?: ContactContent;
}

// ---------------------------------------------------------------
// Full Site Config (V2 — backward compatible)
// ---------------------------------------------------------------

export interface SiteConfig {
  // V1 fields (backward compat)
  site: Site;
  project: Project;
  sections: SiteSections;

  // V2 config groups
  branding?: BrandingConfig;
  theme?: ThemeConfig;
  contact?: ContactConfig;
  features?: FeaturesConfig;
  layout?: LayoutConfig;
  seo?: SeoConfig;
  lead?: LeadConfig;

  // V3 meta
  meta?: ConfigMeta;

  // V4: section-level config (page builder)
  sections_config?: SectionsConfigMap;
}

export interface ConfigMeta {
  configVersion: number;
  loadedAt: string;
}

/**
 * Admin-only: full config map used for editing.
 */
export interface SiteConfigMap {
  branding: BrandingConfig;
  theme: ThemeConfig;
  contact: ContactConfig;
  features: FeaturesConfig;
  layout: LayoutConfig;
  seo: SeoConfig;
  lead: LeadConfig;
  project: ProjectConfig;
}

// ---------------------------------------------------------------
// API types
// ---------------------------------------------------------------

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface LeadPayload {
  site_key?: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  website?: string; // honeypot
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
