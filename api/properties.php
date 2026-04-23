<?php
define('APP_INIT', true);
require_once __DIR__ . '/../core/config/db.php';
require_once __DIR__ . '/../core/helpers/response.php';
require_once __DIR__ . '/../core/helpers/validation.php';
require_once __DIR__ . '/../core/services/PropertyService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') { jsonError('Method not allowed.', 405); }

$projectId = getPositiveInt($_GET['projectId'] ?? null);
if ($projectId <= 0) { jsonError('projectId is required.', 400); }

$filters = [];
if (isset($_GET['minPrice']))  $filters['minPrice']  = getPositiveFloat($_GET['minPrice']);
if (isset($_GET['maxPrice']))  $filters['maxPrice']  = getPositiveFloat($_GET['maxPrice']);
if (isset($_GET['bedrooms']))  $filters['bedrooms']  = getPositiveInt($_GET['bedrooms']);
if (isset($_GET['status']))    $filters['status']    = sanitizeString($_GET['status']);

$page    = getPositiveInt($_GET['page'] ?? 1, 1);
$perPage = getPositiveInt($_GET['perPage'] ?? 6, 6);

try {
    $db = getDB();
    $propertyService = new PropertyService($db);
    $result = $propertyService->getProperties($projectId, $filters, $page, $perPage);
    jsonSuccess($result);
} catch (Exception $e) {
    jsonError('Internal server error.', 500);
}
