<?php
/**
 * Admin API: File Upload
 *
 * POST /api/admin/upload.php
 *   FormData: file (image), site_id (int), context (string: "section-bg" | "property")
 *   Returns: { url: "/uploads/{site_id}/sections/{filename}" }
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonError('Method not allowed.', 405);
}

// Validate required fields
$siteId  = (int)($_POST['site_id'] ?? 0);
$context = trim($_POST['context'] ?? 'section-bg');

if (!$siteId) {
    jsonError('site_id is required.', 422);
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = $_FILES['file']['error'] ?? -1;
    jsonError("Upload failed (error code: {$errorCode}).", 400);
}

$file = $_FILES['file'];

// Validate file type
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedMimes)) {
    jsonError("Invalid file type: {$mime}. Allowed: JPEG, PNG, WebP, GIF, SVG.", 422);
}

// Validate file size (max 5MB)
$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    jsonError('File too large. Maximum size: 5MB.', 422);
}

// Determine upload directory
$baseUploadDir = __DIR__ . '/../../uploads';
$subDir = $context === 'section-bg' ? 'sections' : 'misc';
$uploadDir = "{$baseUploadDir}/{$siteId}/{$subDir}";

// Create directory if not exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
$ext = strtolower($ext);
$filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . ".{$ext}";
$destPath = "{$uploadDir}/{$filename}";

// Move file
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    jsonError('Failed to save uploaded file.', 500);
}

// Return the public URL path
$publicUrl = "/uploads/{$siteId}/{$subDir}/{$filename}";

jsonSuccess([
    'url'      => $publicUrl,
    'filename' => $filename,
    'size'     => $file['size'],
    'mime'     => $mime,
]);
