-- ================================================================
-- Migration V3: Config Cleanup & Schema Extensions
-- Safe, incremental — no data loss, no column drops
-- ================================================================

-- ================================================================
-- TASK 1: Fix data consistency
-- ================================================================

-- Fix domain typo
UPDATE sites SET domain = 'riverside.batdongsanuytin.com' WHERE site_key = 'riverside' AND domain LIKE '%reverside%';

-- Fix contact email in site_configs
UPDATE site_configs
  SET config_value = JSON_SET(config_value, '$.email', 'info@riverside.vn')
  WHERE site_id = 1 AND config_key = 'contact' AND config_value LIKE '%reverside%';

-- Fix email in sites table (V1 fallback)
UPDATE sites SET email = 'info@riverside.vn' WHERE site_key = 'riverside' AND email LIKE '%reverside%';

-- Fix logo path: /uploads/duana/ → /uploads/riverside/
UPDATE site_configs
  SET config_value = REPLACE(config_value, '/uploads/duana/', '/uploads/riverside/')
  WHERE site_id = 1 AND config_value LIKE '%/uploads/duana/%';

UPDATE sites SET logo_url = REPLACE(logo_url, '/uploads/duana/', '/uploads/riverside/') WHERE site_key = 'riverside';

-- Fix SEO ogImage path
UPDATE site_configs
  SET config_value = JSON_SET(config_value, '$.ogImage', '/uploads/riverside/logo.png')
  WHERE site_id = 1 AND config_key = 'seo' AND config_value LIKE '%/uploads/duana/%';

-- Fix lead notifyEmail
UPDATE site_configs
  SET config_value = JSON_SET(config_value, '$.notifyEmail', 'info@riverside.vn')
  WHERE site_id = 1 AND config_key = 'lead' AND config_value LIKE '%duana%';


-- ================================================================
-- TASK 8: Add config_version column to site_configs
-- ================================================================

ALTER TABLE site_configs ADD COLUMN IF NOT EXISTS config_version INT UNSIGNED NOT NULL DEFAULT 1;


-- ================================================================
-- TASK 5: Extend theme config with semantic tokens
-- ================================================================

-- Site 1 (Riverside): Fresh Minimal preset
UPDATE site_configs
  SET config_value = JSON_SET(
    config_value,
    '$.presetId', 'fresh-minimal',
    '$.accentColor', '#4ADE80',
    '$.borderColor', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.borderColor')), 'rgba(5, 46, 22, 0.12)'),
    '$.mutedColor', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.mutedColor')), '#6B7280'),
    '$.borderRadius', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.borderRadius')), '12px')
  ),
  config_version = config_version + 1
  WHERE site_id = 1 AND config_key = 'theme';

-- Site 2 (Sunrise): Dark orange preset
UPDATE site_configs
  SET config_value = JSON_SET(
    config_value,
    '$.presetId', 'sunset-orange',
    '$.accentColor', '#FFD23F',
    '$.borderColor', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.borderColor')), 'rgba(255, 255, 255, 0.08)'),
    '$.mutedColor', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.mutedColor')), '#6B7280'),
    '$.borderRadius', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.borderRadius')), '12px')
  ),
  config_version = config_version + 1
  WHERE site_id = 2 AND config_key = 'theme';


-- ================================================================
-- TASK 6: Extend SEO config
-- ================================================================

UPDATE site_configs
  SET config_value = JSON_SET(
    config_value,
    '$.canonicalUrl', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.canonicalUrl')), ''),
    '$.robots', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.robots')), 'index,follow'),
    '$.schemaJson', JSON_OBJECT()
  ),
  config_version = config_version + 1
  WHERE config_key = 'seo';


-- ================================================================
-- TASK 7: Extend lead config
-- ================================================================

UPDATE site_configs
  SET config_value = JSON_SET(
    config_value,
    '$.saveToDatabase', true,
    '$.autoAssign', false,
    '$.webhookUrl', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.webhookUrl')), ''),
    '$.successMessage', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(config_value, '$.successMessage')), 'Cảm ơn bạn, chuyên viên sẽ liên hệ sớm.')
  ),
  config_version = config_version + 1
  WHERE config_key = 'lead';


-- ================================================================
-- Verify results
-- ================================================================
SELECT s.site_key, sc.config_key, sc.config_version, sc.config_value
FROM site_configs sc
JOIN sites s ON s.id = sc.site_id
ORDER BY sc.site_id, sc.config_key;
