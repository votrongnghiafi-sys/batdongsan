<?php
/**
 * Public API: GET /api/sites/by-key.php?site_key=riverside
 *
 * Returns the full merged config for a site identified by site_key.
 * This is the recommended endpoint for direct site_key lookups.
 *
 * Response: { site, branding, theme, contact, features, layout, seo, lead, project, meta }
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';
require_once __DIR__ . '/../../core/services/SiteService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { jsonError('Method not allowed.', 405); }

$siteKey = trim($_GET['site_key'] ?? '');

if (empty($siteKey)) {
    jsonError('site_key parameter is required.', 400);
}

if (!preg_match('/^[a-z0-9\-]+$/', $siteKey)) {
    jsonError('Invalid site_key format.', 400);
}

try {
    $db = getDB();
    $siteService = new SiteService($db);

    $config = $siteService->getFullSiteConfigV2($siteKey, false);

    if (!$config) {
        jsonError('Site not found.', 404);
    }

    jsonSuccess($config);
} catch (Exception $e) {
    jsonError('Internal server error.', 500);
}
