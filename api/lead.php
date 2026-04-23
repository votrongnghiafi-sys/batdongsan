<?php
define('APP_INIT', true);
require_once __DIR__ . '/../core/config/db.php';
require_once __DIR__ . '/../core/helpers/response.php';
require_once __DIR__ . '/../core/helpers/subdomain.php';
require_once __DIR__ . '/../core/helpers/validation.php';
require_once __DIR__ . '/../core/services/SiteService.php';
require_once __DIR__ . '/../core/services/LeadService.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { jsonError('Method not allowed.', 405); }
if (!checkRateLimit(5)) { jsonError('Quá nhiều yêu cầu. Vui lòng thử lại sau.', 429); }

$body = json_decode(file_get_contents('php://input'), true);
if (!$body || !is_array($body)) { jsonError('Invalid JSON body.', 400); }

$name  = sanitizeString($body['name'] ?? '');
$phone = sanitizeString($body['phone'] ?? '');
if (empty($name))  { jsonError('Vui lòng nhập họ tên.', 422); }
if (empty($phone) || !isValidPhone($phone)) { jsonError('Vui lòng nhập số điện thoại hợp lệ.', 422); }

$email   = sanitizeString($body['email'] ?? '');
$message = sanitizeString($body['message'] ?? '');
if (!isValidEmail($email)) { jsonError('Email không hợp lệ.', 422); }

// Honeypot
if (!empty($body['website'] ?? '')) {
    jsonSuccess(['id' => 0, 'message' => 'Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.'], 201);
}

try {
    $db = getDB();
    $siteKey = $body['site_key'] ?? extractSubdomain();
    if (!$siteKey) { jsonError('Unable to determine site.', 400); }

    $siteService = new SiteService($db);
    $site = $siteService->getSiteByKey($siteKey);
    if (!$site) { jsonError('Site not found.', 404); }

    $project = $siteService->getProjectBySiteId($site['id']);

    $leadService = new LeadService($db);
    $leadId = $leadService->createLead([
        'site_id'    => $site['id'],
        'project_id' => $project['id'] ?? null,
        'name'       => $name,
        'phone'      => $phone,
        'email'      => $email ?: null,
        'message'    => $message ?: null,
        'source'     => 'landing_page',
    ]);

    jsonSuccess(['id' => $leadId, 'message' => 'Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 30 phút.'], 201);
} catch (Exception $e) {
    jsonError('Internal server error.', 500);
}
