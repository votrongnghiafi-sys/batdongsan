<?php
/**
 * AI Color Extraction API
 *
 * POST /api/ai/extract-colors.php
 * Input: multipart/form-data with 'image' field
 * Output: { success: true, data: { primaryColor, secondaryColor, backgroundColor, textColor, accentColor } }
 *
 * Uses GD library (built into XAMPP) to extract dominant colors from images.
 */
define('APP_INIT', true);
require_once __DIR__ . '/../../core/config/db.php';
require_once __DIR__ . '/../../core/helpers/response.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed.', 405);
}

// Validate upload
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonError('Image file is required.', 422);
}

$file = $_FILES['image'];
$maxSize = 10 * 1024 * 1024; // 10MB
if ($file['size'] > $maxSize) {
    jsonError('File too large (max 10MB).', 422);
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes, true)) {
    jsonError('Unsupported image format. Use JPEG, PNG, GIF, WebP, or BMP.', 422);
}

try {
    $palette = extractDominantColors($file['tmp_name'], $mimeType);
    jsonSuccess($palette);
} catch (Exception $e) {
    // Fallback palette
    jsonSuccess([
        'primaryColor'    => '#0A84FF',
        'secondaryColor'  => '#30D158',
        'backgroundColor' => '#08080f',
        'textColor'       => '#f0f0f5',
        'accentColor'     => '#FF6B35',
    ]);
}

// =============================================================
// Color extraction logic
// =============================================================

function extractDominantColors(string $path, string $mimeType): array {
    // Load image with GD
    switch ($mimeType) {
        case 'image/jpeg': $img = imagecreatefromjpeg($path); break;
        case 'image/png':  $img = imagecreatefrompng($path);  break;
        case 'image/gif':  $img = imagecreatefromgif($path);  break;
        case 'image/webp': $img = imagecreatefromwebp($path); break;
        case 'image/bmp':  $img = imagecreatefrombmp($path);  break;
        default: throw new Exception('Unsupported format');
    }

    if (!$img) throw new Exception('Failed to load image');

    // Downscale for performance
    $origW = imagesx($img);
    $origH = imagesy($img);
    $scale = min(1, 80 / max($origW, $origH));
    $w = max(1, (int)($origW * $scale));
    $h = max(1, (int)($origH * $scale));

    $small = imagecreatetruecolor($w, $h);
    imagecopyresampled($small, $img, 0, 0, 0, 0, $w, $h, $origW, $origH);
    imagedestroy($img);

    // Collect color buckets by hue (12 buckets of 30°)
    $buckets = [];
    for ($y = 0; $y < $h; $y++) {
        for ($x = 0; $x < $w; $x++) {
            $rgb = imagecolorat($small, $x, $y);
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;

            // Skip very dark and very bright
            $brightness = ($r + $g + $b) / 3;
            if ($brightness < 15 || $brightness > 245) continue;

            [$hue, $sat, $light] = rgbToHsl($r, $g, $b);

            // Skip grays (low saturation)
            if ($sat < 8) continue;

            $bucketKey = (int)(round($hue / 30) * 30) % 360;
            if (!isset($buckets[$bucketKey])) {
                $buckets[$bucketKey] = ['r' => 0, 'g' => 0, 'b' => 0, 'count' => 0];
            }
            $buckets[$bucketKey]['r'] += $r;
            $buckets[$bucketKey]['g'] += $g;
            $buckets[$bucketKey]['b'] += $b;
            $buckets[$bucketKey]['count']++;
        }
    }
    imagedestroy($small);

    if (empty($buckets)) {
        return defaultPalette();
    }

    // Sort by frequency
    uasort($buckets, fn($a, $b) => $b['count'] - $a['count']);

    $colors = [];
    foreach (array_slice($buckets, 0, 5, true) as $bucket) {
        $avgR = (int)round($bucket['r'] / $bucket['count']);
        $avgG = (int)round($bucket['g'] / $bucket['count']);
        $avgB = (int)round($bucket['b'] / $bucket['count']);
        $colors[] = sprintf('#%02x%02x%02x', $avgR, $avgG, $avgB);
    }

    // Map to roles
    $primary = $colors[0];
    [$ph, $ps, $pl] = hexToHsl($primary);

    $secondary = $colors[1] ?? hslToHex(($ph + 150) % 360, max($ps - 10, 20), min($pl + 5, 65));
    $background = hslToHex($ph, min($ps, 20), 6);
    $textColor = getContrastText($background);
    $accent = $colors[2] ?? hslToHex(($ph + 30) % 360, min($ps + 10, 90), min($pl + 10, 60));

    return [
        'primaryColor'    => $primary,
        'secondaryColor'  => $secondary,
        'backgroundColor' => $background,
        'textColor'       => $textColor,
        'accentColor'     => $accent,
    ];
}

function defaultPalette(): array {
    return [
        'primaryColor'    => '#0A84FF',
        'secondaryColor'  => '#30D158',
        'backgroundColor' => '#08080f',
        'textColor'       => '#f0f0f5',
        'accentColor'     => '#FF6B35',
    ];
}

// =============================================================
// Color math functions
// =============================================================

function rgbToHsl(int $r, int $g, int $b): array {
    $r /= 255; $g /= 255; $b /= 255;
    $max = max($r, $g, $b);
    $min = min($r, $g, $b);
    $l = ($max + $min) / 2;
    $h = 0; $s = 0;

    if ($max !== $min) {
        $d = $max - $min;
        $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
        if ($max === $r)      $h = (($g - $b) / $d + ($g < $b ? 6 : 0)) / 6;
        elseif ($max === $g)  $h = (($b - $r) / $d + 2) / 6;
        else                  $h = (($r - $g) / $d + 4) / 6;
    }

    return [(int)round($h * 360), (int)round($s * 100), (int)round($l * 100)];
}

function hexToHsl(string $hex): array {
    $hex = ltrim($hex, '#');
    return rgbToHsl(
        hexdec(substr($hex, 0, 2)),
        hexdec(substr($hex, 2, 2)),
        hexdec(substr($hex, 4, 2))
    );
}

function hslToHex(int $h, int $s, int $l): string {
    $h = (($h % 360) + 360) % 360;
    $s = max(0, min(100, $s)) / 100;
    $l = max(0, min(100, $l)) / 100;

    $c = (1 - abs(2 * $l - 1)) * $s;
    $x = $c * (1 - abs(fmod($h / 60, 2) - 1));
    $m = $l - $c / 2;

    $r = 0; $g = 0; $b = 0;
    if ($h < 60)       { $r=$c; $g=$x; }
    elseif ($h < 120)  { $r=$x; $g=$c; }
    elseif ($h < 180)  { $g=$c; $b=$x; }
    elseif ($h < 240)  { $g=$x; $b=$c; }
    elseif ($h < 300)  { $r=$x; $b=$c; }
    else               { $r=$c; $b=$x; }

    return sprintf('#%02x%02x%02x',
        (int)round(($r + $m) * 255),
        (int)round(($g + $m) * 255),
        (int)round(($b + $m) * 255)
    );
}

function getContrastText(string $hex): string {
    $hex = ltrim($hex, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    $luminance = (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;
    return $luminance > 0.5 ? '#1a1a2e' : '#f0f0f5';
}
