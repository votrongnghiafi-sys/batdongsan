<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

class SiteService {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getSiteByKey(string $siteKey): ?array {
        $stmt = $this->db->prepare('SELECT id, site_key, name, domain, logo_url, primary_color, secondary_color, phone, email, is_active FROM sites WHERE site_key = :key AND is_active = 1 LIMIT 1');
        $stmt->execute([':key' => $siteKey]);
        return $stmt->fetch() ?: null;
    }

    public function getSiteByDomain(string $domain): ?array {
        $stmt = $this->db->prepare('SELECT id, site_key, name, domain, logo_url, primary_color, secondary_color, phone, email, is_active FROM sites WHERE domain = :domain AND is_active = 1 LIMIT 1');
        $stmt->execute([':domain' => $domain]);
        return $stmt->fetch() ?: null;
    }

    public function getSiteById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM sites WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getProjectBySiteId(int $siteId): ?array {
        $stmt = $this->db->prepare('SELECT id, site_id, name, location, description, hero_image, hero_tagline, status FROM projects WHERE site_id = :siteId ORDER BY id ASC LIMIT 1');
        $stmt->execute([':siteId' => $siteId]);
        return $stmt->fetch() ?: null;
    }

    public function getSections(int $siteId): array {
        $stmt = $this->db->prepare('SELECT section_key, content, sort_order FROM site_sections WHERE site_id = :siteId AND is_active = 1 ORDER BY sort_order ASC');
        $stmt->execute([':siteId' => $siteId]);
        $sections = [];
        foreach ($stmt->fetchAll() as $row) {
            $sections[$row['section_key']] = json_decode($row['content'], true);
        }
        return $sections;
    }

    /**
     * V1 API response — backward compatible with existing frontend.
     * Returns { site, project, sections }
     */
    public function getFullSiteConfig(string $siteKey): ?array {
        $site = $this->getSiteByKey($siteKey);
        if (!$site) return null;
        return [
            'site'     => $site,
            'project'  => $this->getProjectBySiteId($site['id']),
            'sections' => $this->getSections($site['id']),
        ];
    }

    /**
     * V2 API response — SaaS-ready config structure.
     *
     * Returns { site (identity only), project, sections, branding, theme, contact,
     *           features, layout, seo, lead, project_config, meta }
     *
     * Source of truth: site_configs table, with fallback to sites table columns.
     */
    public function getFullSiteConfigV2(string $siteKeyOrDomain, bool $isDomain = false): ?array {
        $site = $isDomain
            ? $this->getSiteByDomain($siteKeyOrDomain)
            : $this->getSiteByKey($siteKeyOrDomain);

        if (!$site) return null;

        require_once __DIR__ . '/SiteConfigService.php';
        $configService = new SiteConfigService($this->db);

        // Pass full site row for fallback logic (TASK 2)
        $merged = $configService->getPublicConfig($site['id'], $site);

        // Add project & sections (V1 compat)
        $merged['project_data'] = $this->getProjectBySiteId($site['id']);
        $merged['sections']     = $this->getSections($site['id']);

        return $merged;
    }

    /**
     * Validate uniqueness of site_key.
     */
    public function isSiteKeyUnique(string $siteKey, int $excludeId = 0): bool {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM sites WHERE site_key = :key AND id != :id');
        $stmt->execute([':key' => $siteKey, ':id' => $excludeId]);
        return (int)$stmt->fetchColumn() === 0;
    }

    /**
     * Validate uniqueness of domain.
     */
    public function isDomainUnique(string $domain, int $excludeId = 0): bool {
        if (empty($domain)) return true;
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM sites WHERE domain = :domain AND id != :id');
        $stmt->execute([':domain' => $domain, ':id' => $excludeId]);
        return (int)$stmt->fetchColumn() === 0;
    }
}
