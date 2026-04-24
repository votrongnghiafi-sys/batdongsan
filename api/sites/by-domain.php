<?php
/**
 * Public API: GET /api/sites/by-domain.php
 *
 * Supported parameters:
 *   ?domain=riverside.batdongsanuytin.com   (recommended)
 *   ?site_key=riverside                      (DEPRECATED — use /api/sites/by-key.php instead)
 *
 * If neither is provided, auto-detects from subdomain.
 *
 * Response: { site, branding, theme, contact, features, layout, seo, lead, project, meta }
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';
require_once __DIR__ . '/../../core/helpers/subdomain.php';
require_once __DIR__ . '/../../core/services/SiteService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { jsonError('Method not allowed.', 405); }

$domain  = trim($_GET['domain'] ?? '');
$siteKey = trim($_GET['site_key'] ?? '');

if (empty($domain) && empty($siteKey)) {
    // Try auto-detect from subdomain
    $siteKey = extractSubdomain();
    if (!$siteKey) {
        jsonError('domain or site_key parameter is required.', 400);
    }
}

try {
    $db = getDB();
    $siteService = new SiteService($db);

    $isDomain = !empty($domain);
    $lookup = $isDomain ? $domain : $siteKey;

    $config = $siteService->getFullSiteConfigV2($lookup, $isDomain);

    if (!$config) {
        jsonError('Site not found.', 404);
    }

    jsonSuccess($config);
} catch (Exception $e) {
    jsonError('Internal server error.', 500);
}
