-- =============================================================
-- BDS Eco 2030: Migration — Eco-specific tables
-- Run AFTER schema.sql and migration_v2_site_configs.sql
-- Safe to re-run (uses IF NOT EXISTS / INSERT IGNORE)
-- =============================================================

SET NAMES utf8mb4;
USE `bds_multisite`;

-- -------------------------------------------------------------
-- 1. eco_properties — Eco-specific property attributes
--    Extends the base `properties` table via property_id FK.
--    Stores sustainability score, energy rating, carbon footprint,
--    solar capacity, green certification, etc.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `eco_properties` (
  `id`                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`             INT UNSIGNED NOT NULL COMMENT 'Owning site',
  `name`                VARCHAR(200) NOT NULL,
  `location`            VARCHAR(300) NOT NULL DEFAULT '',
  `price`               VARCHAR(50)  NOT NULL DEFAULT '' COMMENT 'Display price string e.g. 3.2 tỷ',
  `image_url`           VARCHAR(500) NOT NULL DEFAULT '',
  `property_type`       VARCHAR(50)  NOT NULL DEFAULT 'Căn hộ',
  `area`                DECIMAL(10,2) DEFAULT NULL COMMENT 'Square meters',
  `sustainability_score` TINYINT UNSIGNED NOT NULL DEFAULT 80 COMMENT '0–100 eco score',
  `energy_rating`       VARCHAR(10)  NOT NULL DEFAULT 'A' COMMENT 'A, A+, A++, B, etc.',
  `carbon_footprint`    VARCHAR(80)  NOT NULL DEFAULT '' COMMENT 'e.g. 12 kg CO₂/m²/yr',
  `solar_capacity`      DECIMAL(6,2) NOT NULL DEFAULT 0 COMMENT 'kWp',
  `certification`       VARCHAR(60)  NOT NULL DEFAULT '' COMMENT 'LEED Gold, EDGE, etc.',
  `badge`               VARCHAR(40)  NOT NULL DEFAULT '' COMMENT 'Highlight badge: Bán chạy, Nổi bật, Mới',
  `sort_order`          SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active`           TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_eco_prop_site` (`site_id`),
  KEY `idx_eco_prop_score` (`sustainability_score`),
  CONSTRAINT `fk_eco_prop_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. eco_site_meta — Per-site eco stats & analytics data
--    One row per site. Stores floating hero stats and dashboard
--    analytics values that are managed via admin.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `eco_site_meta` (
  `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`          INT UNSIGNED NOT NULL,
  -- Hero stats
  `energy_saving`    VARCHAR(20) NOT NULL DEFAULT '87%',
  `co2_reduction`    VARCHAR(20) NOT NULL DEFAULT '64%',
  `smart_home_score` VARCHAR(20) NOT NULL DEFAULT '9.4/10',
  -- Project info
  `project_name`     VARCHAR(200) NOT NULL DEFAULT '',
  `project_location` VARCHAR(300) NOT NULL DEFAULT '',
  `starting_price`   VARCHAR(50)  NOT NULL DEFAULT '',
  `project_desc`     TEXT,
  -- Analytics dashboard
  `roi_projection`   VARCHAR(20) NOT NULL DEFAULT '+18.5%',
  `co2_savings`      VARCHAR(40) NOT NULL DEFAULT '1,240 tấn',
  `avg_energy_bill`  VARCHAR(20) NOT NULL DEFAULT '-72%',
  `rental_yield`     VARCHAR(20) NOT NULL DEFAULT '8.2%',
  `infra_growth`     VARCHAR(20) NOT NULL DEFAULT '+34%',
  `created_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_eco_meta_site` (`site_id`),
  CONSTRAINT `fk_eco_meta_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. Seed the eco-2030 site (if not already present)
-- -------------------------------------------------------------
INSERT IGNORE INTO `sites`
  (`site_key`, `name`, `domain`, `primary_color`, `secondary_color`, `phone`, `email`, `is_active`)
VALUES
  ('eco-2030', 'Eco Smart Living 2030', 'eco-2030.bds.local', '#2FA36B', '#DFF5E8', '0900 000 000', 'contact@ecoestate.vn', 1);

-- Site configs for eco-2030
SET @eco_site_id = (SELECT `id` FROM `sites` WHERE `site_key` = 'eco-2030' LIMIT 1);

INSERT IGNORE INTO `site_configs` (`site_id`, `config_key`, `config_value`) VALUES
(@eco_site_id, 'branding', JSON_OBJECT(
  'logoText',  'EcoEstate',
  'siteName',  'Eco Smart Living 2030',
  'slogan',    'Future green property platform',
  'logoUrl',   '',
  'faviconUrl',''
)),
(@eco_site_id, 'theme', JSON_OBJECT(
  'primaryColor',   '#2FA36B',
  'secondaryColor', '#DFF5E8',
  'accentColor',    '#A8E6C1',
  'textColor',      '#102018',
  'backgroundColor','#F7FBF8',
  'borderRadius',   '24px',
  'fontFamily',     'Inter'
)),
(@eco_site_id, 'contact', JSON_OBJECT(
  'phone',   '0900 000 000',
  'zalo',    '0900 000 000',
  'email',   'contact@ecoestate.vn',
  'address', '',
  'workingHours', ''
)),
(@eco_site_id, 'features', JSON_OBJECT(
  'showHero',            true,
  'showProperties',      true,
  'showFilters',         true,
  'showAnalytics',       true,
  'showMap',             true,
  'showAIRecommendation',true,
  'showLeadForm',        true,
  'gallery',             false,
  'propertyFilter',      true,
  'leadForm',            true,
  'map',                 true,
  'chatbot',             false,
  'aiAnalysis',          true,
  'booking',             false
)),
(@eco_site_id, 'seo', JSON_OBJECT(
  'metaTitle',       'Eco Smart Living 2030 – Bất động sản xanh thế hệ mới',
  'metaDescription', 'Khám phá dự án bất động sản xanh tích hợp năng lượng mặt trời, nhà thông minh và hạ tầng bền vững tại Việt Nam.',
  'keywords',        'bất động sản xanh, eco real estate, nhà thông minh 2030, LEED, năng lượng mặt trời',
  'ogImage',         '',
  'robots',          'index,follow'
)),
(@eco_site_id, 'sections', JSON_OBJECT(
  'hero', JSON_OBJECT(
    'enabled',      true,
    'title',        'Eco Smart Living 2030',
    'subtitle',     'Khám phá bất động sản xanh, thông minh và bền vững cho thế hệ mới.',
    'ctaPrimary',   'Xem dự án',
    'ctaSecondary', 'Tư vấn ngay'
  ),
  'properties', JSON_OBJECT('enabled', true, 'title', 'Dự án xanh nổi bật'),
  'filters',    JSON_OBJECT('enabled', true, 'title', 'Tìm dự án phù hợp'),
  'analytics',  JSON_OBJECT('enabled', true, 'title', 'Dữ liệu đầu tư thông minh'),
  'map',        JSON_OBJECT('enabled', true, 'title', 'Bản đồ hạ tầng xanh'),
  'aiRecommendation', JSON_OBJECT('enabled', true, 'title', 'AI Advisor'),
  'leadForm',   JSON_OBJECT('enabled', true, 'title', 'Nhận tư vấn dự án')
));

-- eco_site_meta
INSERT IGNORE INTO `eco_site_meta`
  (`site_id`, `energy_saving`, `co2_reduction`, `smart_home_score`,
   `project_name`, `project_location`, `starting_price`, `project_desc`,
   `roi_projection`, `co2_savings`, `avg_energy_bill`, `rental_yield`, `infra_growth`)
VALUES
  (@eco_site_id, '87%', '64%', '9.4/10',
   'Eco Smart Living 2030', 'Vietnam Smart Growth Corridor', '2.8 tỷ',
   'Dự án bất động sản xanh tích hợp năng lượng mặt trời, nhà thông minh và hạ tầng bền vững.',
   '+18.5%', '1,240 tấn', '-72%', '8.2%', '+34%');

-- eco_properties
INSERT IGNORE INTO `eco_properties`
  (`site_id`, `name`, `location`, `price`, `image_url`, `property_type`, `area`,
   `sustainability_score`, `energy_rating`, `carbon_footprint`,
   `solar_capacity`, `certification`, `badge`, `sort_order`)
VALUES
  (@eco_site_id, 'EcoTower Alpha',      'Thủ Đức, TP.HCM',    '3.2 tỷ',
   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
   'Căn hộ',    72,  94, 'A+',  '12 kg CO₂/m²/yr', 8.5,  'LEED Gold',    'Bán chạy', 1),
  (@eco_site_id, 'Green Horizon Villa', 'Nhơn Trạch, Đồng Nai','6.8 tỷ',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
   'Biệt thự',  210, 98, 'A++', '5 kg CO₂/m²/yr',  22,   'LEED Platinum','Nổi bật',  2),
  (@eco_site_id, 'SkyGreen Residence',  'Long An',             '2.1 tỷ',
   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
   'Townhouse',  90,  88, 'A',   '18 kg CO₂/m²/yr', 5,    'EDGE',         'Mới',      3),
  (@eco_site_id, 'BioLiving Park',      'Bình Dương',          '4.5 tỷ',
   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
   'Shophouse',  125, 91, 'A+',  '9 kg CO₂/m²/yr',  14,   'Green Mark',   '',         4);
