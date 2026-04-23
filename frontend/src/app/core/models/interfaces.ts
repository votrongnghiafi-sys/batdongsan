/**
 * Interfaces for the BDS multi-site system
 */

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

export interface SiteConfig {
  site: Site;
  project: Project;
  sections: SiteSections;
}

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
