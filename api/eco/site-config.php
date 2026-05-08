<?php
/**
 * GET /api/eco/site-config.php?site_key=eco-2030
 *
 * Returns the full EcoSiteConfig JSON for the given site_key.
 * Data is read from MySQL (sites, site_configs, eco_properties, eco_site_meta).
 *
 * Response shape:
 * {
 *   success: true,
 *   data: {
 *     siteId, siteKey, branding, theme, contact, project,
 *     stats, features, sections, properties[], analytics, seo
 *   }
 * }
 *
 * Later: add Redis cache, rate limiting, auth token if needed.
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';
require_once __DIR__ . '/../../core/services/EcoSiteService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Method not allowed.', 405);
}

$siteKey = trim($_GET['site_key'] ?? '');

if (empty($siteKey)) {
    jsonError('site_key parameter is required. Example: ?site_key=eco-2030', 400);
}

if (!preg_match('/^[a-z0-9\-]+$/', $siteKey)) {
    jsonError('Invalid site_key format. Use lowercase letters, numbers and hyphens only.', 400);
}

try {
    $db  = getDB();
    $eco = new EcoSiteService($db);

    $config = $eco->getFullConfig($siteKey);

    if (!$config) {
        jsonError("Site '{$siteKey}' not found. Make sure it exists in the database.", 404);
    }

    jsonSuccess($config);

} catch (Exception $e) {
    // Log for server debugging; never expose internals to client
    error_log('[EcoSiteConfig] ' . $e->getMessage());
    jsonError('Internal server error. Please try again later.', 500);
}
