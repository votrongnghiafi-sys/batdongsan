<?php
if (!defined('APP_INIT')) { http_response_code(403); exit('Direct access denied.'); }

function extractSubdomain(): ?string {
    if (isset($_GET['site_key']) && preg_match('/^[a-z0-9\-]{2,50}$/', $_GET['site_key'])) {
        return $_GET['site_key'];
    }
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $host = preg_replace('/:\d+$/', '', $host);
    if ($host === 'localhost' || filter_var($host, FILTER_VALIDATE_IP) || empty($host)) {
        return null;
    }
    $parts = explode('.', $host);
    $tldCount = 1;
    $knownMultiTlds = ['co.uk', 'com.vn', 'com.au', 'co.jp', 'com.br'];
    foreach ($knownMultiTlds as $multiTld) {
        if (str_ends_with($host, '.' . $multiTld)) { $tldCount = 2; break; }
    }
    $minParts = 2 + $tldCount;
    if (count($parts) >= $minParts) {
        $subdomain = strtolower($parts[0]);
        if ($subdomain === 'www') return null;
        return $subdomain;
    }
    return null;
}
