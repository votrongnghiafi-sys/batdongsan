<?php
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();
$db = getDB();

$method = $_SERVER['REQUEST_METHOD'];

// GET — dashboard stats
if ($method === 'GET') {
    $stats = [
        'sites'       => (int)$db->query("SELECT COUNT(*) FROM sites")->fetchColumn(),
        'projects'    => (int)$db->query("SELECT COUNT(*) FROM projects")->fetchColumn(),
        'properties'  => (int)$db->query("SELECT COUNT(*) FROM properties")->fetchColumn(),
        'totalLeads'  => (int)$db->query("SELECT COUNT(*) FROM leads")->fetchColumn(),
        'unreadLeads' => (int)$db->query("SELECT COUNT(*) FROM leads WHERE is_read = 0")->fetchColumn(),
        'todayLeads'  => (int)$db->query("SELECT COUNT(*) FROM leads WHERE DATE(created_at) = CURDATE()")->fetchColumn(),
    ];

    $recentLeads = $db->query("SELECT l.*, s.name as site_name, s.site_key FROM leads l JOIN sites s ON l.site_id = s.id ORDER BY l.created_at DESC LIMIT 5")->fetchAll();

    $sitesSummary = $db->query("
      SELECT s.*, 
        (SELECT COUNT(*) FROM projects p WHERE p.site_id = s.id) as project_count,
        (SELECT COUNT(*) FROM leads l WHERE l.site_id = s.id) as lead_count
      FROM sites s ORDER BY s.id
    ")->fetchAll();

    jsonSuccess(['stats' => $stats, 'recentLeads' => $recentLeads, 'sites' => $sitesSummary]);
}

jsonError('Method not allowed.', 405);
