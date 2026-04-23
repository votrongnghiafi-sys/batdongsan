<?php
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list sections for a site, or get project
if ($method === 'GET') {
    $siteId = (int)($_GET['site_id'] ?? 0);
    if (!$siteId) jsonError('site_id bắt buộc.', 422);

    $sections = $db->prepare("SELECT * FROM site_sections WHERE site_id = ? ORDER BY sort_order ASC");
    $sections->execute([$siteId]);

    $project = $db->prepare("SELECT * FROM projects WHERE site_id = ? LIMIT 1");
    $project->execute([$siteId]);

    jsonSuccess([
        'sections' => $sections->fetchAll(),
        'project'  => $project->fetch() ?: null,
    ]);
}

// POST — create or update section
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $siteId = (int)($body['site_id'] ?? 0);
    $sectionKey = trim($body['section_key'] ?? '');
    $content = trim($body['content'] ?? '{}');

    if (!$siteId || !$sectionKey) jsonError('site_id và section_key bắt buộc.', 422);

    json_decode($content);
    if (json_last_error() !== JSON_ERROR_NONE) jsonError('JSON không hợp lệ: ' . json_last_error_msg(), 422);

    $sectionId = (int)($body['id'] ?? 0);
    if ($sectionId) {
        $stmt = $db->prepare("UPDATE site_sections SET section_key=?, content=?, sort_order=?, is_active=? WHERE id=? AND site_id=?");
        $stmt->execute([$sectionKey, $content, $body['sort_order'] ?? 0, $body['is_active'] ?? 1, $sectionId, $siteId]);
    } else {
        $stmt = $db->prepare("INSERT INTO site_sections (site_id, section_key, content, sort_order, is_active) VALUES (?,?,?,?,?)");
        $stmt->execute([$siteId, $sectionKey, $content, $body['sort_order'] ?? 0, $body['is_active'] ?? 1]);
        $sectionId = (int)$db->lastInsertId();
    }
    jsonSuccess(['id' => $sectionId]);
}

// PUT — update project
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $siteId = (int)($body['site_id'] ?? 0);
    $projectId = (int)($body['id'] ?? 0);

    if ($projectId) {
        $stmt = $db->prepare("UPDATE projects SET name=?, location=?, description=?, hero_image=?, hero_tagline=?, status=? WHERE id=? AND site_id=?");
        $stmt->execute([
            trim($body['name'] ?? ''),
            trim($body['location'] ?? ''),
            trim($body['description'] ?? ''),
            trim($body['hero_image'] ?? ''),
            trim($body['hero_tagline'] ?? ''),
            $body['status'] ?? 'selling',
            $projectId, $siteId,
        ]);
    } else {
        $stmt = $db->prepare("INSERT INTO projects (site_id, name, location, description, hero_image, hero_tagline, status) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([
            $siteId,
            trim($body['name'] ?? ''),
            trim($body['location'] ?? ''),
            trim($body['description'] ?? ''),
            trim($body['hero_image'] ?? ''),
            trim($body['hero_tagline'] ?? ''),
            $body['status'] ?? 'selling',
        ]);
    }
    jsonSuccess(['updated' => true]);
}

// DELETE — delete section
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    $siteId = (int)($_GET['site_id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);
    $db->prepare("DELETE FROM site_sections WHERE id = ? AND site_id = ?")->execute([$id, $siteId]);
    jsonSuccess(['deleted' => true]);
}

jsonError('Method not allowed.', 405);
