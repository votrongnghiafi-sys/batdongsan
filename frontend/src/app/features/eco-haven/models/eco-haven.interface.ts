export interface EcoHavenNavLink { label: string; active?: boolean; }
export interface EcoHavenImpactStat { icon: string; label: string; value: string; change: string; positive: boolean; }
export interface EcoHavenMenuItem { label: string; icon: string; badge?: number; active?: boolean; }

export interface EcoHavenDashboardCard {
  id: string;
  type: 'default' | 'score' | 'chart';
  title: string;
  value: string;
  unit?: string;
  trend: string;
  trendUp: boolean;
  color: string;
  link?: string;
  // score type
  maxLabel?: string;
  scorePercent?: number;
  subScores?: number[];
  // chart type
  chartPoints?: number[];
}

export interface EcoHavenSidebar {
  logo: string;
  tagline: string;
  menu: EcoHavenMenuItem[];
  aiBox: { title: string; matchCount: number; ctaLabel: string; };
  impactStats: EcoHavenImpactStat[];
  impactTitle: string;
  viewImpactLabel: string;
}

export interface EcoHavenTopbar {
  navLinks: EcoHavenNavLink[];
  searchPlaceholder: string;
  user: { name: string; avatarInitials: string; role: string; avatar?: string; };
  notifications: number;
}

export interface EcoHavenHero {
  headline: string;
  headlineHighlight: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  socialProof: string;
  buildingImage: string;
  floatingTags: Array<{ label: string; subLabel: string; icon: string; pos: string; }>;
}

export interface EcoHavenProperty {
  id: number; name: string; location: string; price: string;
  beds: number; baths: number; area: number;
  score: number; roi: string; image: string; badge?: string;
}

export interface EcoHavenFeature { icon: string; title: string; description: string; }

export interface EcoHavenRightPanel {
  carbon:  { value: string; unit: string; note: string; percent: number; };
  score:   { value: string; max: string; label: string; subScores: Array<{ icon: string; value: number; }>; };
  trend:   { value: string; periodLabel: string; points: number[]; };
  cta:     { headline: string; subtitle: string; ctaLabel: string; image: string; };
}

export interface EcoHavenConfig {
  sidebar: EcoHavenSidebar;
  topbar: EcoHavenTopbar;
  hero: EcoHavenHero;
  dashboardCards: EcoHavenDashboardCard[];
  propertiesSection: { title: string; viewAllLabel: string; properties: EcoHavenProperty[]; };
  featuresSection:   { title: string; subtitle?: string; features: EcoHavenFeature[]; };
  rightPanel: EcoHavenRightPanel;
}
