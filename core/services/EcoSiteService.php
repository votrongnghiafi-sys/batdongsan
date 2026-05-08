<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

/**
 * EcoSiteService
 * Reads eco-specific data from:
 *   - eco_site_meta  → stats, analytics, project info
 *   - eco_properties → property cards with sustainability data
 *   - site_configs   → branding, theme, contact, features, sections, seo
 *   - sites          → site identity
 *
 * Assembles the full EcoSiteConfig shape consumed by the Angular landing page.
 */
class EcoSiteService {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Get the full eco site config for a given site_key.
     * Returns null if the site is not found.
     */
    public function getFullConfig(string $siteKey): ?array {
        $site = $this->getSiteByKey($siteKey);
        if (!$site) return null;

        $siteId = (int)$site['id'];

        // Load all config groups from site_configs
        $configs    = $this->getSiteConfigs($siteId, $site);
        $meta       = $this->getEcoMeta($siteId);
        $properties = $this->getEcoProperties($siteId);

        // Build the EcoSiteConfig shape matching the Angular interface
        return [
            'siteId'   => $siteId,
            'siteKey'  => $site['site_key'],
            'branding' => $configs['branding'],
            'theme'    => $configs['theme'],
            'contact'  => $configs['contact'],
            'project'  => [
                'name'         => $meta['project_name']     ?? $site['name'],
                'location'     => $meta['project_location'] ?? '',
                'startingPrice'=> $meta['starting_price']   ?? '',
                'description'  => $meta['project_desc']     ?? '',
            ],
            'stats' => [
                'energySaving'    => $meta['energy_saving']    ?? '87%',
                'co2Reduction'    => $meta['co2_reduction']    ?? '64%',
                'smartHomeScore'  => $meta['smart_home_score'] ?? '9.4/10',
            ],
            'features' => $configs['features'],
            'sections' => $configs['sections'],
            'properties' => $properties,
            'analytics' => [
                'roiProjection' => $meta['roi_projection'] ?? '+18.5%',
                'co2Savings'    => $meta['co2_savings']    ?? '1,240 tấn',
                'avgEnergyBill' => $meta['avg_energy_bill']?? '-72%',
                'rentalYield'   => $meta['rental_yield']   ?? '8.2%',
                'infraGrowth'   => $meta['infra_growth']   ?? '+34%',
            ],
            'seo' => [
                'metaTitle'       => $configs['seo']['metaTitle']       ?? '',
                'metaDescription' => $configs['seo']['metaDescription'] ?? '',
                'keywords'        => $configs['seo']['keywords']        ?? '',
            ],
        ];
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private function getSiteByKey(string $siteKey): ?array {
        $stmt = $this->db->prepare(
            'SELECT id, site_key, name, domain, logo_url, primary_color, secondary_color,
                    phone, email, is_active
             FROM sites
             WHERE site_key = :key AND is_active = 1
             LIMIT 1'
        );
        $stmt->execute([':key' => $siteKey]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Load and merge config groups from site_configs with defaults.
     */
    private function getSiteConfigs(int $siteId, array $siteRow): array {
        $stmt = $this->db->prepare(
            'SELECT config_key, config_value FROM site_configs WHERE site_id = :siteId'
        );
        $stmt->execute([':siteId' => $siteId]);

        $raw = [];
        foreach ($stmt->fetchAll() as $row) {
            $raw[$row['config_key']] = json_decode($row['config_value'], true) ?: [];
        }

        // ── Branding ──────────────────────────────────────────────
        $branding = $raw['branding'] ?? [];
        if (empty($branding['siteName'])) $branding['siteName'] = $siteRow['name'];
        if (empty($branding['logoText'])) $branding['logoText'] = $siteRow['name'];
        if (empty($branding['slogan']))   $branding['slogan']   = '';

        // ── Theme ─────────────────────────────────────────────────
        $theme = array_merge([
            'primaryColor'    => $siteRow['primary_color']   ?? '#2FA36B',
            'secondaryColor'  => $siteRow['secondary_color'] ?? '#DFF5E8',
            'accentColor'     => '#A8E6C1',
            'textColor'       => '#102018',
            'backgroundColor' => '#F7FBF8',
            'borderRadius'    => '24px',
            'fontFamily'      => 'Inter',
        ], $raw['theme'] ?? []);

        // ── Contact ───────────────────────────────────────────────
        $contact = array_merge([
            'phone' => $siteRow['phone'] ?? '',
            'email' => $siteRow['email'] ?? '',
            'zalo'  => '',
        ], $raw['contact'] ?? []);

        // ── Features ──────────────────────────────────────────────
        $features = array_merge([
            'showHero'             => true,
            'showProperties'       => true,
            'showFilters'          => true,
            'showAnalytics'        => true,
            'showMap'              => true,
            'showAIRecommendation' => true,
            'showLeadForm'         => true,
        ], $raw['features'] ?? []);

        // ── Sections ──────────────────────────────────────────────
        $defaultSections = [
            'hero'             => ['enabled' => true, 'title' => 'Eco Smart Living 2030',
                                   'subtitle' => 'Khám phá bất động sản xanh, thông minh và bền vững cho thế hệ mới.',
                                   'ctaPrimary' => 'Xem dự án', 'ctaSecondary' => 'Tư vấn ngay'],
            'properties'       => ['enabled' => true, 'title' => 'Dự án xanh nổi bật'],
            'filters'          => ['enabled' => true, 'title' => 'Tìm dự án phù hợp'],
            'analytics'        => ['enabled' => true, 'title' => 'Dữ liệu đầu tư thông minh'],
            'map'              => ['enabled' => true, 'title' => 'Bản đồ hạ tầng xanh'],
            'aiRecommendation' => ['enabled' => true, 'title' => 'AI Advisor'],
            'leadForm'         => ['enabled' => true, 'title' => 'Nhận tư vấn dự án'],
        ];
        $storedSections = $raw['sections'] ?? [];
        $sections = [];
        foreach ($defaultSections as $key => $default) {
            $sections[$key] = array_merge($default, $storedSections[$key] ?? []);
        }

        // ── SEO ───────────────────────────────────────────────────
        $seo = array_merge([
            'metaTitle'       => $siteRow['name'] ?? '',
            'metaDescription' => '',
            'keywords'        => '',
        ], $raw['seo'] ?? []);

        return compact('branding', 'theme', 'contact', 'features', 'sections', 'seo');
    }

    /**
     * Read eco_site_meta row for this site.
     * Returns empty array if not set up yet.
     */
    private function getEcoMeta(int $siteId): array {
        $stmt = $this->db->prepare(
            'SELECT * FROM eco_site_meta WHERE site_id = :siteId LIMIT 1'
        );
        $stmt->execute([':siteId' => $siteId]);
        return $stmt->fetch() ?: [];
    }

    /**
     * Read eco_properties for this site, ordered by sort_order.
     * Returns them in the shape expected by the Angular PropertyCardsComponent.
     */
    private function getEcoProperties(int $siteId): array {
        $stmt = $this->db->prepare(
            'SELECT id, name, location, price, image_url AS image,
                    property_type AS type, area, sustainability_score AS sustainabilityScore,
                    energy_rating AS energyRating, carbon_footprint AS carbonFootprint,
                    solar_capacity AS solar, certification, badge
             FROM eco_properties
             WHERE site_id = :siteId AND is_active = 1
             ORDER BY sort_order ASC'
        );
        $stmt->execute([':siteId' => $siteId]);
        $rows = $stmt->fetchAll();

        // Cast numeric types
        return array_map(function (array $p): array {
            $p['id']                 = (int)$p['id'];
            $p['area']               = (float)($p['area'] ?? 0);
            $p['sustainabilityScore']= (int)$p['sustainabilityScore'];
            $p['solar']              = (float)$p['solar'];
            return $p;
        }, $rows);
    }
}
