<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

function sanitizeString(?string $input): string {
    if ($input === null) return '';
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function isValidPhone(string $phone): bool {
    return (bool) preg_match('/^[\d\s\-\+\(\)]{8,20}$/', $phone);
}

function isValidEmail(?string $email): bool {
    if (empty($email)) return true;
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

function getPositiveInt($value, int $default = 0): int {
    $val = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    return ($val !== false) ? $val : $default;
}

function getPositiveFloat($value, float $default = 0.0): float {
    $val = filter_var($value, FILTER_VALIDATE_FLOAT);
    return ($val !== false && $val >= 0) ? $val : $default;
}

function checkRateLimit(int $maxPerMinute = 5): bool {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $now = time();
    $key = 'rate_limit_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    if (!isset($_SESSION[$key])) $_SESSION[$key] = [];
    $_SESSION[$key] = array_filter($_SESSION[$key], fn($t) => ($now - $t) < 60);
    if (count($_SESSION[$key]) >= $maxPerMinute) return false;
    $_SESSION[$key][] = $now;
    return true;
}
