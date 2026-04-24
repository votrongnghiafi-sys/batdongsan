<?php
/**
 * Admin API: Site Config management
 *
 * GET    /api/admin/config.php?site_id=N           — Get all config groups for site
 * GET    /api/admin/config.php?site_id=N&key=theme — Get single config group
 * PUT    /api/admin/config.php                      — Update config (partial merge)
 *        Body: { site_id: N, configs: { theme: {...}, branding: {...} } }
 * PUT    /api/admin/config.php  (single key)
 *        Body: { site_id: N, config_key: "theme", config_value: {...} }
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';
require_once __DIR__ . '/../../core/helpers/validation.php';
require_once __DIR__ . '/../../core/services/SiteConfigService.php';
require_once __DIR__ . '/../../core/services/SiteService.php';

setCorsHeaders();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET — read configs
if ($method === 'GET') {
    $siteId = getPositiveInt($_GET['site_id'] ?? 0);
    if (!$siteId) { jsonError('site_id is required.', 422); }

    $configService = new SiteConfigService($db);
    $key = trim($_GET['key'] ?? '');

    if ($key) {
        $config = $configService->getConfig($siteId, $key);
        if (empty($config)) { jsonError("Invalid config key: {$key}", 422); }
        jsonSuccess([$key => $config]);
    }

    jsonSuccess($configService->getAllConfigs($siteId));
}

// PUT — update configs (merge)
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body || !is_array($body)) { jsonError('Invalid JSON body.', 400); }

    $siteId = getPositiveInt($body['site_id'] ?? 0);
    if (!$siteId) { jsonError('site_id is required.', 422); }

    // Verify site exists
    $siteService = new SiteService($db);
    $site = $siteService->getSiteById($siteId);
    if (!$site) { jsonError('Site not found.', 404); }

    $configService = new SiteConfigService($db);

    // Mode 1: Batch update — { configs: { theme: {...}, branding: {...} } }
    if (isset($body['configs']) && is_array($body['configs'])) {
        $configService->saveAllConfigs($siteId, $body['configs']);
        // Sync back to sites table for backward compatibility
        $configService->syncToSitesTable($siteId, $body['configs']);
        jsonSuccess(['updated' => true, 'keys' => array_keys($body['configs'])]);
    }

    // Mode 2: Single key — { config_key: "theme", config_value: {...} }
    $key   = trim($body['config_key'] ?? '');
    $value = $body['config_value'] ?? null;

    if (!$key) { jsonError('config_key or configs object is required.', 422); }
    if (!is_array($value)) { jsonError('config_value must be a JSON object.', 422); }

    $ok = $configService->saveConfig($siteId, $key, $value);
    if (!$ok) { jsonError("Invalid config key: {$key}", 422); }

    // Sync back
    $configService->syncToSitesTable($siteId, [$key => $value]);

    jsonSuccess(['updated' => true, 'key' => $key]);
}

jsonError('Method not allowed.', 405);
