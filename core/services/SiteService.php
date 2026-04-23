<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

class SiteService {
    private PDO $db;
    public function __construct(PDO $db) { $this->db = $db; }

    public function getSiteByKey(string $siteKey): ?array {
        $stmt = $this->db->prepare('SELECT id, site_key, name, domain, logo_url, primary_color, secondary_color, phone, email FROM sites WHERE site_key = :key AND is_active = 1 LIMIT 1');
        $stmt->execute([':key' => $siteKey]);
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

    public function getFullSiteConfig(string $siteKey): ?array {
        $site = $this->getSiteByKey($siteKey);
        if (!$site) return null;
        return [
            'site'     => $site,
            'project'  => $this->getProjectBySiteId($site['id']),
            'sections' => $this->getSections($site['id']),
        ];
    }
}
