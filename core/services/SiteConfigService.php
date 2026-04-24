<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

/**
 * SiteConfigService — V3 SaaS-ready config management.
 *
 * Source of truth: site_configs table (JSON key-value store).
 * Fallback: sites table columns (for backward compatibility).
 * 
 * TODO (future): Drop duplicate columns from sites table after confirming
 *   all code paths use site_configs exclusively:
 *   - logo_url, primary_color, secondary_color, phone, email
 */
class SiteConfigService {
    private PDO $db;

    /** All recognized config groups */
    private const VALID_KEYS = [
        'branding', 'theme', 'contact', 'features',
        'layout', 'seo', 'lead', 'project',
    ];

    /**
     * Default values per config group — V3 extended.
     * New fields are additive; old fields remain unchanged.
     */
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
            // V3 semantic tokens
            'presetId'     => '',
            'accentColor'  => '#38BDF8',
            'borderColor'  => 'rgba(255, 255, 255, 0.08)',
            'mutedColor'   => '#6B7280',
            'borderRadius' => '12px',
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
            // V3
            'canonicalUrl' => '',
            'robots'       => 'index,follow',
            'schemaJson'   => [],
        ],
        'lead' => [
            'formTitle'      => 'Liên hệ tư vấn',
            'formSubtitle'   => 'Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút',
            'requiredFields' => ['name', 'phone'],
            'enableHoneypot' => true,
            'rateLimit'      => 5,
            'notifyEmail'    => '',
            // V3
            'saveToDatabase'  => true,
            'autoAssign'      => false,
            'webhookUrl'      => '',
            'successMessage'  => 'Cảm ơn bạn, chuyên viên sẽ liên hệ sớm.',
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
            'SELECT config_key, config_value, config_version FROM site_configs WHERE site_id = :siteId'
        );
        $stmt->execute([':siteId' => $siteId]);

        $result = [];
        $maxVersion = 0;
        foreach (self::VALID_KEYS as $key) {
            $result[$key] = self::DEFAULTS[$key] ?? [];
        }

        foreach ($stmt->fetchAll() as $row) {
            $key = $row['config_key'];
            if (isset($result[$key])) {
                $stored = json_decode($row['config_value'], true) ?: [];
                $result[$key] = array_merge($result[$key], $stored);
                $maxVersion = max($maxVersion, (int)($row['config_version'] ?? 1));
            }
        }

        // Store max version for meta
        $result['_configVersion'] = $maxVersion;

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
            INSERT INTO site_configs (site_id, config_key, config_value, config_version)
            VALUES (:siteId, :key, :val, 1)
            ON DUPLICATE KEY UPDATE config_value = :val2, config_version = config_version + 1, updated_at = NOW()
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
     *
     * TODO (future): Remove this method after confirming all code
     *   paths use site_configs as source of truth.
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
    // Layout helper — TASK 4
    // ---------------------------------------------------------------

    /**
     * Get homepage layout with fallback to site_sections table.
     *
     * Priority:
     * 1. site_configs.layout.homepage (V2+ source of truth)
     * 2. site_sections ordered by sort_order (V1 fallback)
     * 3. Hard-coded default
     *
     * TODO (future): Remove site_sections fallback after full migration.
     *   site_sections can later become a content table or be removed.
     */
    public function getHomepageLayout(int $siteId): array {
        // Try V2 config
        $layout = $this->getConfig($siteId, 'layout');
        if (!empty($layout['homepage']) && is_array($layout['homepage'])) {
            return $layout['homepage'];
        }

        // Fallback to V1 site_sections
        $stmt = $this->db->prepare(
            'SELECT section_key FROM site_sections WHERE site_id = :siteId ORDER BY sort_order ASC'
        );
        $stmt->execute([':siteId' => $siteId]);
        $sections = $stmt->fetchAll(PDO::FETCH_COLUMN);

        if (!empty($sections)) {
            return $sections;
        }

        // Hard-coded default
        return self::DEFAULTS['layout']['homepage'];
    }

    // ---------------------------------------------------------------
    // Public API: Full config response
    // ---------------------------------------------------------------

    /**
     * Build the complete public config response for a site.
     * Used by GET /api/sites/by-domain and by-key
     *
     * Returns clean response with:
     * - site (identity only — no duplicate config fields)
     * - all config groups
     * - meta block with versioning
     */
    public function getPublicConfig(int $siteId, array $siteRow = []): array {
        $configs = $this->getAllConfigs($siteId);
        $configVersion = $configs['_configVersion'] ?? 1;
        unset($configs['_configVersion']);

        // Clean site identity block (TASK 2)
        $site = [
            'id'       => (int)$siteRow['id'],
            'siteKey'  => $siteRow['site_key'],
            'name'     => $siteRow['name'],
            'domain'   => $siteRow['domain'],
            'isActive' => (bool)$siteRow['is_active'],
        ];

        // Fallback: if branding is empty, use sites table (TASK 2)
        if (empty($configs['branding']['logoUrl']) && !empty($siteRow['logo_url'])) {
            $configs['branding']['logoUrl'] = $siteRow['logo_url'];
        }
        if (empty($configs['branding']['siteName']) && !empty($siteRow['name'])) {
            $configs['branding']['siteName'] = $siteRow['name'];
        }

        // Fallback: theme from sites table
        if (empty($configs['theme']['primaryColor']) && !empty($siteRow['primary_color'])) {
            $configs['theme']['primaryColor'] = $siteRow['primary_color'];
        }
        if (empty($configs['theme']['secondaryColor']) && !empty($siteRow['secondary_color'])) {
            $configs['theme']['secondaryColor'] = $siteRow['secondary_color'];
        }

        // Fallback: contact from sites table
        if (empty($configs['contact']['phone']) && !empty($siteRow['phone'])) {
            $configs['contact']['phone'] = $siteRow['phone'];
        }
        if (empty($configs['contact']['email']) && !empty($siteRow['email'])) {
            $configs['contact']['email'] = $siteRow['email'];
        }

        // Override layout with unified helper (TASK 4)
        $configs['layout'] = [
            'homepage' => $this->getHomepageLayout($siteId),
        ];

        // Only expose public-safe lead fields
        $configs['lead'] = [
            'formTitle'      => $configs['lead']['formTitle'],
            'formSubtitle'   => $configs['lead']['formSubtitle'],
            'requiredFields' => $configs['lead']['requiredFields'],
            'successMessage' => $configs['lead']['successMessage'] ?? 'Cảm ơn bạn, chuyên viên sẽ liên hệ sớm.',
        ];

        return array_merge(
            ['site' => $site],
            $configs,
            [
                'meta' => [
                    'configVersion' => $configVersion,
                    'loadedAt'      => date('c'), // ISO 8601
                ],
            ]
        );
    }

    // ---------------------------------------------------------------
    // Validation — TASK 10
    // ---------------------------------------------------------------

    /**
     * Validate a config group. Returns array of error messages (empty = valid).
     */
    public function validate(string $configKey, array $data): array {
        $errors = [];

        switch ($configKey) {
            case 'theme':
                foreach (['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'accentColor'] as $field) {
                    if (isset($data[$field]) && $data[$field] !== '' && !preg_match('/^#[0-9A-Fa-f]{6}$/', $data[$field])) {
                        // Also allow rgba(...) and named colors for borderColor
                        if ($field !== 'borderColor') {
                            $errors[] = "$field must be a valid HEX color (e.g. #FF0000).";
                        }
                    }
                }
                break;

            case 'lead':
                if (isset($data['rateLimit']) && (!is_numeric($data['rateLimit']) || (int)$data['rateLimit'] < 1)) {
                    $errors[] = "rateLimit must be a positive integer.";
                }
                if (isset($data['requiredFields']) && !is_array($data['requiredFields'])) {
                    $errors[] = "requiredFields must be an array.";
                }
                if (!empty($data['notifyEmail']) && !filter_var($data['notifyEmail'], FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "notifyEmail must be a valid email address.";
                }
                if (!empty($data['webhookUrl']) && !filter_var($data['webhookUrl'], FILTER_VALIDATE_URL)) {
                    $errors[] = "webhookUrl must be a valid URL.";
                }
                break;

            case 'seo':
                if (!empty($data['metaTitle']) && mb_strlen($data['metaTitle']) > 70) {
                    $errors[] = "metaTitle should be 70 characters or less (currently " . mb_strlen($data['metaTitle']) . ").";
                }
                if (!empty($data['metaDescription']) && mb_strlen($data['metaDescription']) > 160) {
                    $errors[] = "metaDescription should be 160 characters or less (currently " . mb_strlen($data['metaDescription']) . ").";
                }
                break;
        }

        return $errors;
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
