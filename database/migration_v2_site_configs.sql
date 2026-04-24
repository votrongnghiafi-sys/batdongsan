-- =============================================================
-- BDS Multi-Site: Migration V2 — site_configs key-value store
-- Run this AFTER schema.sql + seed.sql are already applied.
-- This migration is SAFE to re-run (uses IF NOT EXISTS / IGNORE).
-- =============================================================

SET NAMES utf8mb4;
USE `bds_multisite`;

-- -------------------------------------------------------------
-- 1. Create site_configs table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_configs` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`       INT UNSIGNED NOT NULL,
  `config_key`    VARCHAR(50)  NOT NULL COMMENT 'Config group: branding, theme, contact, features, layout, seo, lead, project',
  `config_value`  JSON         NOT NULL,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_config` (`site_id`, `config_key`),
  CONSTRAINT `fk_config_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 2. Add index for domain-based lookup on sites table
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS `idx_sites_domain` ON `sites` (`domain`);

-- -------------------------------------------------------------
-- 3. Migrate existing site data into site_configs
--    Uses INSERT IGNORE to be idempotent (safe to re-run)
-- -------------------------------------------------------------

-- 3a. Branding config (logo, favicon)
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'branding', JSON_OBJECT(
  'logoUrl', COALESCE(`logo_url`, ''),
  'faviconUrl', '',
  'siteName', `name`
)
FROM `sites`;

-- 3b. Theme config (colors)
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'theme', JSON_OBJECT(
  'primaryColor', COALESCE(`primary_color`, '#0A84FF'),
  'secondaryColor', COALESCE(`secondary_color`, '#30D158'),
  'backgroundColor', '#08080f',
  'textColor', '#f0f0f5',
  'fontFamily', 'Inter'
)
FROM `sites`;

-- 3c. Contact config
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'contact', JSON_OBJECT(
  'phone', COALESCE(`phone`, ''),
  'email', COALESCE(`email`, ''),
  'address', '',
  'workingHours', ''
)
FROM `sites`;

-- 3d. Features config (defaults)
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'features', JSON_OBJECT(
  'chatbot', false,
  'aiAnalysis', false,
  'booking', false,
  'gallery', true,
  'propertyFilter', true,
  'leadForm', true,
  'map', true
)
FROM `sites`;

-- 3e. Layout config (default sections order)
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'layout', JSON_OBJECT(
  'homepage', JSON_ARRAY(
    'hero',
    'about',
    'property-list',
    'amenities',
    'gallery',
    'location',
    'lead-form'
  )
)
FROM `sites`;

-- 3f. SEO config (defaults)
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT s.`id`, 'seo', JSON_OBJECT(
  'metaTitle', s.`name`,
  'metaDescription', CONCAT('Dự án bất động sản ', s.`name`, ' - Thông tin chi tiết, bảng giá mới nhất.'),
  'ogImage', COALESCE(s.`logo_url`, ''),
  'keywords', ''
)
FROM `sites` s;

-- 3g. Lead config
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT `id`, 'lead', JSON_OBJECT(
  'formTitle', 'Liên hệ tư vấn',
  'formSubtitle', 'Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút',
  'requiredFields', JSON_ARRAY('name', 'phone'),
  'enableHoneypot', true,
  'rateLimit', 5,
  'notifyEmail', COALESCE(`email`, '')
)
FROM `sites`;

-- 3h. Project config
INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`)
SELECT s.`id`, 'project', JSON_OBJECT(
  'defaultView', 'grid',
  'itemsPerPage', 6,
  'showPrice', true,
  'showArea', true,
  'showStatus', true,
  'priceUnit', 'VND'
)
FROM `sites` s;

-- Enrich contact config from site_sections contact data (if exists)
UPDATE `site_configs` sc
JOIN `site_sections` ss ON ss.`site_id` = sc.`site_id` AND ss.`section_key` = 'contact'
SET sc.`config_value` = JSON_OBJECT(
  'phone', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ss.`content`, '$.phone')), ''),
  'email', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ss.`content`, '$.email')), ''),
  'address', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ss.`content`, '$.address')), ''),
  'workingHours', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(ss.`content`, '$.workingHours')), '')
)
WHERE sc.`config_key` = 'contact';

-- Done!
-- The old sites columns (primary_color, phone, email, logo_url) remain
-- untouched for backward compatibility. They can be removed in v3.
