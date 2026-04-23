<?php
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';
require_once __DIR__ . '/../../core/helpers/validation.php';

setCorsHeaders();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list all sites
if ($method === 'GET') {
    $sites = $db->query("
      SELECT s.*, 
        (SELECT COUNT(*) FROM projects p WHERE p.site_id = s.id) as project_count,
        (SELECT COUNT(*) FROM leads l WHERE l.site_id = s.id) as lead_count
      FROM sites s ORDER BY s.id
    ")->fetchAll();
    jsonSuccess($sites);
}

// POST — create site
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $siteKey = trim($body['site_key'] ?? '');
    $name = trim($body['name'] ?? '');
    if (!$siteKey || !$name) jsonError('site_key và name bắt buộc.', 422);

    $stmt = $db->prepare("INSERT INTO sites (site_key, name, domain, phone, email, primary_color, secondary_color, logo_url, is_active) VALUES (?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        $siteKey, $name,
        trim($body['domain'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['email'] ?? ''),
        trim($body['primary_color'] ?? '#0A84FF'),
        trim($body['secondary_color'] ?? '#30D158'),
        trim($body['logo_url'] ?? ''),
        $body['is_active'] ?? 1,
    ]);
    $siteId = (int)$db->lastInsertId();

    // Auto-create project
    $db->prepare("INSERT INTO projects (site_id, name, status) VALUES (?, ?, 'selling')")->execute([$siteId, $name]);

    jsonSuccess(['id' => $siteId], 201);
}

// PUT — update site
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = (int)($body['id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);

    $stmt = $db->prepare("UPDATE sites SET site_key=?, name=?, domain=?, phone=?, email=?, primary_color=?, secondary_color=?, logo_url=?, is_active=? WHERE id=?");
    $stmt->execute([
        trim($body['site_key'] ?? ''),
        trim($body['name'] ?? ''),
        trim($body['domain'] ?? ''),
        trim($body['phone'] ?? ''),
        trim($body['email'] ?? ''),
        trim($body['primary_color'] ?? '#0A84FF'),
        trim($body['secondary_color'] ?? '#30D158'),
        trim($body['logo_url'] ?? ''),
        $body['is_active'] ?? 1,
        $id,
    ]);
    jsonSuccess(['updated' => true]);
}

// DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);
    $db->prepare("DELETE FROM sites WHERE id = ?")->execute([$id]);
    jsonSuccess(['deleted' => true]);
}

jsonError('Method not allowed.', 405);
