<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

/**
 * SiteConfigService — Handles the new site_configs key-value store.
 * Reads, writes, merges JSON config groups per site.
 */
class SiteConfigService {
    private PDO $db;

    /** All recognized config groups */
    private const VALID_KEYS = [
        'branding', 'theme', 'contact', 'features',
        'layout', 'seo', 'lead', 'project',
    ];

    /** Default values per config group */
    private const DEFAULTS = [
        'branding' => [
            'logoUrl'    => '',
            'faviconUrl' => '',
            'siteName'   => '',
        ],
        'theme' => [
            'primaryColor'    => '#0A84FF',
            'secondaryColor'  => '#30D158',
            'backgroundColor' => '#08080f',
            'textColor'       => '#f0f0f5',
            'fontFamily'      => 'Inter',
        ],
        'contact' => [
            'phone'        => '',
            'email'        => '',
            'address'      => '',
            'workingHours' => '',
        ],
        'features' => [
            'chatbot'        => false,
            'aiAnalysis'     => false,
            'booking'        => false,
            'gallery'        => true,
            'propertyFilter' => true,
            'leadForm'       => true,
            'map'            => true,
        ],
        'layout' => [
            'homepage' => [
                'hero', 'about', 'property-list',
                'amenities', 'gallery', 'location', 'lead-form',
            ],
        ],
        'seo' => [
            'metaTitle'       => '',
            'metaDescription' => '',
            'ogImage'         => '',
            'keywords'        => '',
        ],
        'lead' => [
            'formTitle'      => 'Liên hệ tư vấn',
            'formSubtitle'   => 'Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút',
            'requiredFields' => ['name', 'phone'],
            'enableHoneypot' => true,
            'rateLimit'      => 5,
            'notifyEmail'    => '',
        ],
        'project' => [
            'defaultView'  => 'grid',
            'itemsPerPage' => 6,
            'showPrice'    => true,
            'showArea'     => true,
            'showStatus'   => true,
            'priceUnit'    => 'VND',
        ],
    ];

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // ---------------------------------------------------------------
    // READ operations
    // ---------------------------------------------------------------

    /**
     * Get all config groups for a site, merged with defaults.
     */
    public function getAllConfigs(int $siteId): array {
        $stmt = $this->db->prepare(
            'SELECT config_key, config_value FROM site_configs WHERE site_id = :siteId'
        );
        $stmt->execute([':siteId' => $siteId]);

        $result = [];
        foreach (self::VALID_KEYS as $key) {
            $result[$key] = self::DEFAULTS[$key] ?? [];
        }

        foreach ($stmt->fetchAll() as $row) {
            $key = $row['config_key'];
            if (isset($result[$key])) {
                $stored = json_decode($row['config_value'], true) ?: [];
                $result[$key] = array_merge($result[$key], $stored);
            }
        }

        return $result;
    }

    /**
     * Get a single config group by key.
     */
    public function getConfig(int $siteId, string $configKey): array {
        if (!in_array($configKey, self::VALID_KEYS, true)) {
            return [];
        }

        $stmt = $this->db->prepare(
            'SELECT config_value FROM site_configs WHERE site_id = :siteId AND config_key = :key LIMIT 1'
        );
        $stmt->execute([':siteId' => $siteId, ':key' => $configKey]);
        $row = $stmt->fetch();

        $defaults = self::DEFAULTS[$configKey] ?? [];
        if (!$row) {
            return $defaults;
        }

        $stored = json_decode($row['config_value'], true) ?: [];
        return array_merge($defaults, $stored);
    }

    // ---------------------------------------------------------------
    // WRITE operations
    // ---------------------------------------------------------------

    /**
     * Save (upsert) a single config group. Merges with existing values.
     */
    public function saveConfig(int $siteId, string $configKey, array $value): bool {
        if (!in_array($configKey, self::VALID_KEYS, true)) {
            return false;
        }

        // Merge with existing
        $existing = $this->getConfig($siteId, $configKey);
        $merged = array_merge($existing, $value);
        $json = json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = $this->db->prepare('
            INSERT INTO site_configs (site_id, config_key, config_value)
            VALUES (:siteId, :key, :val)
            ON DUPLICATE KEY UPDATE config_value = :val2, updated_at = NOW()
        ');

        return $stmt->execute([
            ':siteId' => $siteId,
            ':key'    => $configKey,
            ':val'    => $json,
            ':val2'   => $json,
        ]);
    }

    /**
     * Save multiple config groups at once (batch update).
     */
    public function saveAllConfigs(int $siteId, array $configs): void {
        $this->db->beginTransaction();
        try {
            foreach ($configs as $key => $value) {
                if (in_array($key, self::VALID_KEYS, true) && is_array($value)) {
                    $this->saveConfig($siteId, $key, $value);
                }
            }
            $this->db->commit();
        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Sync branding/theme/contact changes back to the sites table
     * for backward compatibility with old code paths.
     */
    public function syncToSitesTable(int $siteId, array $configs): void {
        $updates = [];
        $params = [':id' => $siteId];

        if (isset($configs['branding'])) {
            $updates[] = 'logo_url = :logo_url';
            $updates[] = 'name = :name';
            $params[':logo_url'] = $configs['branding']['logoUrl'] ?? '';
            $params[':name'] = $configs['branding']['siteName'] ?? '';
        }

        if (isset($configs['theme'])) {
            $updates[] = 'primary_color = :pc';
            $updates[] = 'secondary_color = :sc';
            $params[':pc'] = $configs['theme']['primaryColor'] ?? '#0A84FF';
            $params[':sc'] = $configs['theme']['secondaryColor'] ?? '#30D158';
        }

        if (isset($configs['contact'])) {
            $updates[] = 'phone = :phone';
            $updates[] = 'email = :email';
            $params[':phone'] = $configs['contact']['phone'] ?? '';
            $params[':email'] = $configs['contact']['email'] ?? '';
        }

        if (empty($updates)) return;

        $sql = 'UPDATE sites SET ' . implode(', ', $updates) . ' WHERE id = :id';
        $this->db->prepare($sql)->execute($params);
    }

    // ---------------------------------------------------------------
    // Public API: Full config response
    // ---------------------------------------------------------------

    /**
     * Build the complete public config response for a site.
     * Used by GET /api/sites/by-domain
     */
    public function getPublicConfig(int $siteId): array {
        $configs = $this->getAllConfigs($siteId);

        // Only expose public-safe keys
        return [
            'branding' => $configs['branding'],
            'theme'    => $configs['theme'],
            'contact'  => $configs['contact'],
            'features' => $configs['features'],
            'layout'   => $configs['layout'],
            'seo'      => $configs['seo'],
            'lead'     => [
                'formTitle'      => $configs['lead']['formTitle'],
                'formSubtitle'   => $configs['lead']['formSubtitle'],
                'requiredFields' => $configs['lead']['requiredFields'],
            ],
            'project'  => $configs['project'],
        ];
    }

    /**
     * Get valid config keys for validation.
     */
    public static function getValidKeys(): array {
        return self::VALID_KEYS;
    }

    /**
     * Get default values for a config group.
     */
    public static function getDefaults(string $key): array {
        return self::DEFAULTS[$key] ?? [];
    }
}
