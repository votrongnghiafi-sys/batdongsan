-- ================================================================
-- Migration V4: Page Builder — Section-level configuration
-- Safe, additive — no data loss, backward compatible
-- ================================================================

-- Add "sections" config group with default content per site
-- This migrates V1 site_sections content into V2 site_configs format

-- Site 1 (Riverside) — migrate from site_sections + project data
INSERT INTO site_configs (site_id, config_key, config_value, config_version)
VALUES (1, 'sections', JSON_OBJECT(
  'hero', JSON_OBJECT(
    'enabled', true,
    'title', 'Dự án Riverside Villa',
    'subtitle', 'Nơi cuộc sống thượng lưu bắt đầu',
    'backgroundImage', '/uploads/riverside/hero.jpg',
    'ctaText', 'Đăng ký tư vấn',
    'ctaLink', '#section-contact'
  ),
  'about', JSON_OBJECT(
    'enabled', true,
    'title', 'Về dự án',
    'description', 'Khu biệt thự ven sông cao cấp tại Quận 2, TP.HCM.'
  ),
  'property-list', JSON_OBJECT(
    'enabled', true,
    'limit', 6,
    'sort', 'price_desc',
    'showFeaturedOnly', false
  ),
  'amenities', JSON_OBJECT(
    'enabled', true
  ),
  'gallery', JSON_OBJECT(
    'enabled', true,
    'layout', 'grid'
  ),
  'location', JSON_OBJECT(
    'enabled', true
  ),
  'lead-form', JSON_OBJECT(
    'enabled', true
  )
), 1)
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), config_version = config_version + 1;

-- Site 2 (Sunrise)
INSERT INTO site_configs (site_id, config_key, config_value, config_version)
VALUES (2, 'sections', JSON_OBJECT(
  'hero', JSON_OBJECT(
    'enabled', true,
    'title', 'Sunrise City Apartments',
    'subtitle', 'Căn hộ cao cấp trung tâm Quận 7',
    'backgroundImage', '/uploads/sunrise/hero.jpg',
    'ctaText', 'Xem bảng giá',
    'ctaLink', '#section-contact'
  ),
  'about', JSON_OBJECT(
    'enabled', true,
    'title', 'Về dự án',
    'description', 'Căn hộ cao cấp tại trung tâm Quận 7 với tầm nhìn panorama toàn thành phố.'
  ),
  'property-list', JSON_OBJECT(
    'enabled', true,
    'limit', 6,
    'sort', 'price_asc',
    'showFeaturedOnly', false
  ),
  'amenities', JSON_OBJECT(
    'enabled', true
  ),
  'gallery', JSON_OBJECT(
    'enabled', true,
    'layout', 'grid'
  ),
  'location', JSON_OBJECT(
    'enabled', true
  ),
  'lead-form', JSON_OBJECT(
    'enabled', true
  )
), 1)
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), config_version = config_version + 1;

-- Verify
SELECT s.site_key, sc.config_key, sc.config_version,
  JSON_PRETTY(sc.config_value) as config_value
FROM site_configs sc JOIN sites s ON s.id = sc.site_id
WHERE sc.config_key = 'sections'
ORDER BY sc.site_id;
