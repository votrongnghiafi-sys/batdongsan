<?php
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list properties (optionally by project)
if ($method === 'GET') {
    $projectId = (int)($_GET['project_id'] ?? 0);
    $where = $projectId ? "WHERE p.project_id = {$projectId}" : "";

    $props = $db->query("
      SELECT p.*, pr.name as project_name, s.site_key
      FROM properties p
      JOIN projects pr ON p.project_id = pr.id
      JOIN sites s ON pr.site_id = s.id
      {$where}
      ORDER BY p.is_featured DESC, p.price ASC
    ")->fetchAll();

    $projects = $db->query("SELECT p.id, p.name, s.site_key FROM projects p JOIN sites s ON p.site_id = s.id ORDER BY s.site_key")->fetchAll();

    jsonSuccess(['properties' => $props, 'projects' => $projects]);
}

// POST — create property
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $stmt = $db->prepare("INSERT INTO properties (project_id, title, price, area, bedrooms, bathrooms, floor, direction, description, is_featured, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    $stmt->execute([
        (int)$body['project_id'],
        trim($body['title'] ?? ''),
        (float)($body['price'] ?? 0),
        $body['area'] ? (float)$body['area'] : null,
        $body['bedrooms'] ? (int)$body['bedrooms'] : null,
        $body['bathrooms'] ? (int)$body['bathrooms'] : null,
        trim($body['floor'] ?? '') ?: null,
        trim($body['direction'] ?? '') ?: null,
        trim($body['description'] ?? '') ?: null,
        $body['is_featured'] ?? 0,
        $body['status'] ?? 'available',
    ]);
    jsonSuccess(['id' => (int)$db->lastInsertId()], 201);
}

// PUT — update property
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = (int)($body['id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);

    $stmt = $db->prepare("UPDATE properties SET project_id=?, title=?, price=?, area=?, bedrooms=?, bathrooms=?, floor=?, direction=?, description=?, is_featured=?, status=? WHERE id=?");
    $stmt->execute([
        (int)$body['project_id'],
        trim($body['title'] ?? ''),
        (float)($body['price'] ?? 0),
        $body['area'] ? (float)$body['area'] : null,
        $body['bedrooms'] ? (int)$body['bedrooms'] : null,
        $body['bathrooms'] ? (int)$body['bathrooms'] : null,
        trim($body['floor'] ?? '') ?: null,
        trim($body['direction'] ?? '') ?: null,
        trim($body['description'] ?? '') ?: null,
        $body['is_featured'] ?? 0,
        $body['status'] ?? 'available',
        $id,
    ]);
    jsonSuccess(['updated' => true]);
}

// DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);
    $db->prepare("DELETE FROM properties WHERE id = ?")->execute([$id]);
    jsonSuccess(['deleted' => true]);
}

jsonError('Method not allowed.', 405);
