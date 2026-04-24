<?php
/**
 * Public API: GET /api/sites/by-domain.php?domain=xxx
 * Returns the full merged config for a site identified by domain.
 *
 * Also supports: ?site_key=xxx for backward compat / testing.
 *
 * Response: { site, project, sections, branding, theme, contact, features, layout, seo, lead, project_config }
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
