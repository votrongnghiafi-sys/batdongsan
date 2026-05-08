/**
 * EcoSiteConfig — Full typed interface for eco-2030 multi-site config.
 * Loaded from /assets/configs/[siteKey].site.json
 * Designed for config-driven rendering — no hardcoded content in templates.
 */

export interface EcoBranding {
  siteName: string;
  logoText: string;
  slogan: string;
}

export interface EcoTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
}

export interface EcoContact {
  phone: string;
  zalo?: string;
  email: string;
}

export interface EcoProject {
  name: string;
  location: string;
  startingPrice: string;
  description: string;
}

export interface EcoStats {
  energySaving: string;
  co2Reduction: string;
  smartHomeScore: string;
}

export interface EcoFeatures {
  showHero: boolean;
  showProperties: boolean;
  showFilters: boolean;
  showAnalytics: boolean;
  showMap: boolean;
  showAIRecommendation: boolean;
  showLeadForm: boolean;
  [key: string]: boolean;
}

export interface EcoSectionBase {
  enabled: boolean;
  title: string;
}

export interface EcoHeroSection extends EcoSectionBase {
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export interface EcoSectionsConfig {
  hero: EcoHeroSection;
  properties: EcoSectionBase;
  filters: EcoSectionBase;
  analytics: EcoSectionBase;
  map: EcoSectionBase;
  aiRecommendation: EcoSectionBase;
  leadForm: EcoSectionBase;
}

export interface EcoProperty {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  sustainabilityScore: number;
  energyRating: string;
  carbonFootprint: string;
  type: string;
  area: number;
  solar: number;
  certification: string;
  badge: string;
}

export interface EcoAnalytics {
  roiProjection: string;
  co2Savings: string;
  avgEnergyBill: string;
  rentalYield: string;
  infraGrowth: string;
}

export interface EcoSeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export interface EcoSiteConfig {
  siteId: number;
  siteKey: string;
  branding: EcoBranding;
  theme: EcoTheme;
  contact: EcoContact;
  project: EcoProject;
  stats: EcoStats;
  features: EcoFeatures;
  sections: EcoSectionsConfig;
  properties: EcoProperty[];
  analytics: EcoAnalytics;
  seo?: EcoSeoConfig;
}

/** Filter state for SmartFilters component */
export interface EcoFilterState {
  location: string;
  minPrice: number;
  maxPrice: number;
  ecoScore: number;
  propertyType: string;
  minSolar: number;
  certification: string;
}
