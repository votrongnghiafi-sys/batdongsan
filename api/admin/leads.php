<?php
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET — list leads with filters
if ($method === 'GET') {
    $siteId = (int)($_GET['site_id'] ?? 0);
    $status = $_GET['status'] ?? '';

    $where = [];
    $params = [];
    if ($siteId) { $where[] = "l.site_id = ?"; $params[] = $siteId; }
    if ($status === 'unread') { $where[] = "l.is_read = 0"; }
    if ($status === 'read')   { $where[] = "l.is_read = 1"; }
    $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    $stmt = $db->prepare("
      SELECT l.*, s.name as site_name, s.site_key, p.name as project_name
      FROM leads l 
      JOIN sites s ON l.site_id = s.id 
      LEFT JOIN projects p ON l.project_id = p.id
      {$whereSql}
      ORDER BY l.created_at DESC
      LIMIT 200
    ");
    $stmt->execute($params);

    $sites = $db->query("SELECT id, site_key, name FROM sites ORDER BY id")->fetchAll();

    jsonSuccess(['leads' => $stmt->fetchAll(), 'sites' => $sites]);
}

// PUT — mark as read
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);
    $action = $body['action'] ?? '';

    if ($action === 'mark_read') {
        $id = (int)($body['id'] ?? 0);
        if ($id) $db->prepare("UPDATE leads SET is_read = 1 WHERE id = ?")->execute([$id]);
        jsonSuccess(['updated' => true]);
    }

    if ($action === 'mark_all_read') {
        $siteId = (int)($body['site_id'] ?? 0);
        if ($siteId) {
            $db->prepare("UPDATE leads SET is_read = 1 WHERE site_id = ? AND is_read = 0")->execute([$siteId]);
        } else {
            $db->exec("UPDATE leads SET is_read = 1 WHERE is_read = 0");
        }
        jsonSuccess(['updated' => true]);
    }

    jsonError('action bắt buộc.', 422);
}

// DELETE
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) jsonError('id bắt buộc.', 422);
    $db->prepare("DELETE FROM leads WHERE id = ?")->execute([$id]);
    jsonSuccess(['deleted' => true]);
}

jsonError('Method not allowed.', 405);
