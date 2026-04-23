-- =============================================================
-- BDS Multi-Site Real Estate Landing Page System
-- Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS `bds_multisite`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `bds_multisite`;

-- -------------------------------------------------------------
-- 1. sites — Each subdomain maps to one site
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sites` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_key`   VARCHAR(50)  NOT NULL COMMENT 'Subdomain identifier',
  `name`       VARCHAR(150) NOT NULL,
  `domain`     VARCHAR(255) NOT NULL,
  `logo_url`   VARCHAR(500) DEFAULT NULL,
  `primary_color` VARCHAR(7) DEFAULT '#0A84FF',
  `secondary_color` VARCHAR(7) DEFAULT '#30D158',
  `phone`      VARCHAR(20) DEFAULT NULL,
  `email`      VARCHAR(100) DEFAULT NULL,
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_key` (`site_key`)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 2. projects
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`     INT UNSIGNED NOT NULL,
  `name`        VARCHAR(200) NOT NULL,
  `location`    VARCHAR(300) DEFAULT NULL,
  `description` TEXT,
  `hero_image`  VARCHAR(500) DEFAULT NULL,
  `hero_tagline` VARCHAR(300) DEFAULT NULL,
  `status`      ENUM('upcoming','selling','sold_out') NOT NULL DEFAULT 'selling',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_site` (`site_id`),
  CONSTRAINT `fk_project_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 3. properties
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `properties` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id`  INT UNSIGNED NOT NULL,
  `title`       VARCHAR(250) NOT NULL,
  `price`       DECIMAL(15,2) NOT NULL DEFAULT 0,
  `area`        DECIMAL(10,2) DEFAULT NULL,
  `bedrooms`    TINYINT UNSIGNED DEFAULT NULL,
  `bathrooms`   TINYINT UNSIGNED DEFAULT NULL,
  `floor`       VARCHAR(20) DEFAULT NULL,
  `direction`   VARCHAR(30) DEFAULT NULL,
  `description` TEXT,
  `lat`         DECIMAL(10,8) DEFAULT NULL,
  `lng`         DECIMAL(11,8) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status`      ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_property_project` (`project_id`),
  KEY `idx_property_price` (`price`),
  CONSTRAINT `fk_property_project` FOREIGN KEY (`project_id`)
    REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 4. property_images
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `property_images` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `property_id` INT UNSIGNED NOT NULL,
  `image_url`   VARCHAR(500) NOT NULL,
  `alt_text`    VARCHAR(250) DEFAULT NULL,
  `sort_order`  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_propimg_property` (`property_id`),
  CONSTRAINT `fk_propimg_property` FOREIGN KEY (`property_id`)
    REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 5. site_sections
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_sections` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`     INT UNSIGNED NOT NULL,
  `section_key` VARCHAR(60) NOT NULL,
  `content`     JSON NOT NULL,
  `sort_order`  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_section` (`site_id`, `section_key`),
  CONSTRAINT `fk_section_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- 6. leads
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `leads` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_id`     INT UNSIGNED NOT NULL,
  `project_id`  INT UNSIGNED DEFAULT NULL,
  `name`        VARCHAR(150) NOT NULL,
  `phone`       VARCHAR(30) NOT NULL,
  `email`       VARCHAR(150) DEFAULT NULL,
  `message`     TEXT,
  `source`      VARCHAR(50) DEFAULT 'landing_page',
  `ip_address`  VARCHAR(45) DEFAULT NULL,
  `is_read`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lead_site` (`site_id`),
  KEY `idx_lead_project` (`project_id`),
  KEY `idx_lead_created` (`created_at`),
  CONSTRAINT `fk_lead_site` FOREIGN KEY (`site_id`)
    REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lead_project` FOREIGN KEY (`project_id`)
    REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
