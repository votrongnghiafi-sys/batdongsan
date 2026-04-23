<?php
define('APP_INIT', true);
require_once __DIR__ . '/../core/config/db.php';
require_once __DIR__ . '/../core/helpers/response.php';
require_once __DIR__ . '/../core/helpers/subdomain.php';
require_once __DIR__ . '/../core/services/SiteService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { jsonError('Method not allowed.', 405); }

$siteKey = extractSubdomain();
if (!$siteKey) { jsonError('Unable to determine site. Use ?site_key=xxx for testing.', 400); }

try {
    $db = getDB();
    $siteService = new SiteService($db);
    $config = $siteService->getFullSiteConfig($siteKey);
    if (!$config) { jsonError('Site not found.', 404); }
    jsonSuccess($config);
} catch (Exception $e) {
    jsonError('Internal server error.', 500);
}
