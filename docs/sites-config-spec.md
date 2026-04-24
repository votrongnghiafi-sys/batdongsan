# BDS Multi-Site — Full Site Configuration Spec (V4)

> Updated: 2026-04-25T00:36:00+03:00
> Database: `bds_multisite`
> Config Version: V4 (Page Builder foundation)

---

## 📊 Database Overview

| Table | Records | Purpose |
|-------|---------|---------|
| `sites` | 2 | Core site identity (key, domain, is_active) |
| `site_configs` | 18 | Source of truth — 9 JSON config groups × 2 sites |
| `projects` | 2 | Dự án bất động sản |
| `properties` | 11 | Bất động sản (6 + 5) |
| `property_images` | 0 | Ảnh BĐS |
| `site_sections` | 12 | V1 layout fallback (6 × 2) |
| `leads` | 0 | Form liên hệ |

### Source of Truth Hierarchy

```
site_configs    ← PRIMARY (V3, SaaS-ready)
  ↓ fallback
sites table     ← LEGACY (logo_url, primary_color, secondary_color, phone, email)
  ↓ fallback
DEFAULTS        ← hardcoded in SiteConfigService.php
```

> **TODO (future):** Drop duplicate columns from `sites` table after full migration:
> `logo_url`, `primary_color`, `secondary_color`, `phone`, `email`

---

## 🌐 Site #1: Riverside

### General

| Field | Value |
|-------|-------|
| ID | 1 |
| Site Key | `riverside` |
| Name | Dự Án Riverside |
| Domain | `riverside.batdongsanuytin.com` |
| Active | ✅ Yes |
| Created | 2026-04-22 19:10:53 |

### Branding (v1)

```json
{
  "logoUrl": "/uploads/riverside/logo.png",
  "faviconUrl": "",
  "siteName": "Dự Án Riverside"
}
```

### Theme (v3)

```json
{
  "primaryColor": "#22C55E",
  "secondaryColor": "#14532D",
  "backgroundColor": "#F0FDF4",
  "textColor": "#052E16",
  "fontFamily": "Poppins",
  "presetId": "fresh-minimal",
  "accentColor": "#4ADE80",
  "borderColor": "rgba(5, 46, 22, 0.12)",
  "mutedColor": "#6B7280",
  "borderRadius": "12px"
}
```

### Contact (v1)

```json
{
  "phone": "0909 123 456",
  "email": "info@riverside.vn",
  "address": "Đường Nguyễn Thị Định, Quận 2, TP.HCM",
  "workingHours": "8:00 - 20:00 (T2 - CN)"
}
```

### Project Settings (v1)

```json
{
  "defaultView": "grid",
  "itemsPerPage": 6,
  "showPrice": true,
  "showArea": true,
  "showStatus": true,
  "priceUnit": "VND"
}
```

### Lead Form (v2 → v3)

```json
{
  "formTitle": "Liên hệ tư vấn",
  "formSubtitle": "Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút",
  "requiredFields": ["name", "phone"],
  "enableHoneypot": true,
  "rateLimit": 5,
  "notifyEmail": "info@riverside.vn",
  "saveToDatabase": true,
  "autoAssign": false,
  "webhookUrl": "",
  "successMessage": "Cảm ơn bạn, chuyên viên sẽ liên hệ sớm."
}
```

### Features (v1)

```json
{
  "chatbot": true,
  "aiAnalysis": true,
  "booking": true,
  "gallery": true,
  "propertyFilter": true,
  "leadForm": true,
  "map": true
}
```

### Layout (v1)

```json
{
  "homepage": [
    "hero",
    "property-list",
    "about",
    "amenities",
    "gallery",
    "location",
    "lead-form"
  ]
}
```

> **Fallback chain:** `site_configs.layout.homepage` → `site_sections ORDER BY sort_order` → hardcoded default

### Sections Config (v4 — Page Builder)

```json
{
  "hero": {
    "enabled": true,
    "title": "Dự án Riverside Villa",
    "subtitle": "Nơi cuộc sống thượng lưu bắt đầu",
    "backgroundImage": "/uploads/riverside/hero.jpg",
    "ctaText": "Đăng ký tư vấn",
    "ctaLink": "#section-contact"
  },
  "about": {
    "enabled": true,
    "title": "Về dự án",
    "description": "Khu biệt thự ven sông cao cấp tại Quận 2, TP.HCM."
  },
  "property-list": {
    "enabled": true,
    "limit": 6,
    "sort": "price_desc",
    "showFeaturedOnly": false
  },
  "amenities": { "enabled": true },
  "gallery": { "enabled": true, "layout": "grid" },
  "location": { "enabled": true },
  "lead-form": { "enabled": true }
}
```

### SEO (v2 → v3)

```json
{
  "metaTitle": "Dự Án Riverside",
  "metaDescription": "Dự án bất động sản Dự Án Riverside - Thông tin chi tiết, bảng giá mới nhất.",
  "ogImage": "/uploads/riverside/logo.png",
  "keywords": "Riverside",
  "canonicalUrl": "",
  "robots": "index,follow",
  "schemaJson": {}
}
```

### Properties (6 BĐS)

| ID | Title | Price (VND) | Area (m²) | Bed | Bath | Status |
|----|-------|-------------|-----------|-----|------|--------|
| 1 | Biệt thự A01 - Ven sông | 15,500,000,000 | 320.5 | 5 | 4 | Available |
| 2 | Biệt thự A02 - Hồ bơi riêng | 12,800,000,000 | 280.0 | 4 | 3 | Available |
| 3 | Biệt thự B01 - Sân vườn | 9,200,000,000 | 220.0 | 4 | 3 | Available |
| 4 | Biệt thự B02 - Corner | 10,500,000,000 | 250.0 | 4 | 3 | Available |
| 5 | Biệt thự C01 - Sky Garden | 18,000,000,000 | 380.0 | 5 | 5 | Reserved |
| 6 | Biệt thự C02 - Premium | 14,200,000,000 | 300.0 | 5 | 4 | Available |

---

## 🌐 Site #2: Sunrise

### General

| Field | Value |
|-------|-------|
| ID | 2 |
| Site Key | `sunrise` |
| Name | Sunrise City Apartments |
| Domain | `sunrise.batdongsanuytin.com` |
| Active | ✅ Yes |
| Created | 2026-04-22 19:10:53 |

### Branding (v1)

```json
{
  "logoUrl": "/uploads/sunrise/logo.png",
  "faviconUrl": "",
  "siteName": "Sunrise City Apartments"
}
```

### Theme (v3)

```json
{
  "primaryColor": "#FF6B35",
  "secondaryColor": "#FFD23F",
  "backgroundColor": "#08080f",
  "textColor": "#f0f0f5",
  "fontFamily": "Inter",
  "presetId": "sunset-orange",
  "accentColor": "#FFD23F",
  "borderColor": "rgba(255, 255, 255, 0.08)",
  "mutedColor": "#6B7280",
  "borderRadius": "12px"
}
```

### Contact (v1)

```json
{
  "phone": "0912 456 789",
  "email": "hello@sunrise-city.vn",
  "address": "Đại lộ Nguyễn Văn Linh, Quận 7, TP.HCM",
  "workingHours": "8:00 - 21:00 (T2 - CN)"
}
```

### Project Settings (v1)

```json
{
  "defaultView": "grid",
  "itemsPerPage": 6,
  "showPrice": true,
  "showArea": true,
  "showStatus": true,
  "priceUnit": "VND"
}
```

### Lead Form (v2 → v3)

```json
{
  "formTitle": "Liên hệ tư vấn",
  "formSubtitle": "Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút",
  "requiredFields": ["name", "phone"],
  "enableHoneypot": true,
  "rateLimit": 5,
  "notifyEmail": "hello@sunrise-city.vn",
  "saveToDatabase": true,
  "autoAssign": false,
  "webhookUrl": "",
  "successMessage": "Cảm ơn bạn, chuyên viên sẽ liên hệ sớm."
}
```

### Features (v1)

```json
{
  "chatbot": false,
  "aiAnalysis": false,
  "booking": false,
  "gallery": true,
  "propertyFilter": true,
  "leadForm": true,
  "map": true
}
```

### Layout (v1)

```json
{
  "homepage": [
    "hero",
    "about",
    "property-list",
    "amenities",
    "gallery",
    "location",
    "lead-form"
  ]
}
```

### Sections Config (v4 — Page Builder)

```json
{
  "hero": {
    "enabled": true,
    "title": "Sunrise City Apartments",
    "subtitle": "Căn hộ cao cấp trung tâm Quận 7",
    "backgroundImage": "/uploads/sunrise/hero.jpg",
    "ctaText": "Xem bảng giá",
    "ctaLink": "#section-contact"
  },
  "about": {
    "enabled": true,
    "title": "Về dự án",
    "description": "Căn hộ cao cấp tại trung tâm Quận 7."
  },
  "property-list": {
    "enabled": true,
    "limit": 6,
    "sort": "price_asc",
    "showFeaturedOnly": false
  },
  "amenities": { "enabled": true },
  "gallery": { "enabled": true, "layout": "grid" },
  "location": { "enabled": true },
  "lead-form": { "enabled": true }
}
```

### SEO (v2 → v3)

```json
{
  "metaTitle": "Sunrise City Apartments",
  "metaDescription": "Dự án bất động sản Sunrise City Apartments - Thông tin chi tiết, bảng giá mới nhất.",
  "ogImage": "/uploads/sunrise/logo.png",
  "keywords": "",
  "canonicalUrl": "",
  "robots": "index,follow",
  "schemaJson": {}
}
```

### Properties (5 BĐS)

| ID | Title | Price (VND) | Area (m²) | Bed | Bath | Status |
|----|-------|-------------|-----------|-----|------|--------|
| 7 | Căn hộ 1PN - Studio Plus | 2,800,000,000 | 52.0 | 1 | 1 | Available |
| 8 | Căn hộ 2PN - City View | 4,500,000,000 | 78.0 | 2 | 2 | Available |
| 9 | Căn hộ 3PN - River View | 6,200,000,000 | 105.0 | 3 | 2 | Available |
| 10 | Penthouse Duplex | 12,000,000,000 | 200.0 | 4 | 3 | Reserved |
| 11 | Căn hộ 2PN - Garden View | 4,200,000,000 | 75.0 | 2 | 2 | Available |

---

## ⚙️ Config Groups Schema (V4)

Each site has **9 config groups** stored in `site_configs` as JSON key-value pairs with versioning:

| Group | Key | Version | Fields |
|-------|-----|---------|--------|
| Branding | `branding` | v1 | logoUrl, faviconUrl, siteName |
| Theme | `theme` | **v3** | primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, **presetId, accentColor, borderColor, mutedColor, borderRadius** |
| Contact | `contact` | v1 | phone, email, address, workingHours |
| Project | `project` | v1 | defaultView, itemsPerPage, showPrice, showArea, showStatus, priceUnit |
| Lead | `lead` | **v2** | formTitle, formSubtitle, requiredFields, enableHoneypot, rateLimit, notifyEmail, **saveToDatabase, autoAssign, webhookUrl, successMessage** |
| Features | `features` | v1 | chatbot, aiAnalysis, booking, gallery, propertyFilter, leadForm, map |
| Layout | `layout` | v1 | homepage (string[]) |
| **Sections** | `sections` | **v4** | **Per-section config: enabled, title, subtitle, backgroundImage, ctaText, ctaLink, limit, sort, showFeaturedOnly, layout** |
| SEO | `seo` | **v2** | metaTitle, metaDescription, ogImage, keywords, **canonicalUrl, robots, schemaJson** |

> **Bold** = V3/V4 additions

### V4 Section Merge Logic

```
layout.homepage         ← ordering (which sections, in which order)
sections config         ← per-section settings (content + visibility)
DEFAULT_SECTIONS        ← fallback for missing configs
features toggle         ← override: if feature=false, section.enabled=false
→ API: sections_config   ← merged result for rendering
```

---

## 🔌 API Endpoints

### Public

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sites/by-key.php?site_key=riverside` | **Recommended** — lookup by site_key |
| GET | `/api/sites/by-domain.php?domain=riverside.batdongsanuytin.com` | Lookup by domain |
| GET | `/api/sites/by-domain.php?site_key=riverside` | ⚠️ **DEPRECATED** — use `by-key.php` |

### Admin

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/sites.php` | List all sites |
| POST | `/api/admin/sites.php` | Create site |
| PUT | `/api/admin/sites.php` | Update site |
| DELETE | `/api/admin/sites.php?id=1` | Delete site |
| GET | `/api/admin/config.php?site_id=1` | Get all config groups |
| GET | `/api/admin/config.php?site_id=1&key=theme` | Get single group |
| PUT | `/api/admin/config.php` | Batch update configs |

### AI

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ai/extract-colors.php` | Extract palette from uploaded image |

### Public API Response Structure

```json
{
  "success": true,
  "data": {
    "site": {
      "id": 1,
      "siteKey": "riverside",
      "name": "Dự Án Riverside",
      "domain": "riverside.batdongsanuytin.com",
      "isActive": true
    },
    "branding": { "logoUrl": "...", "faviconUrl": "...", "siteName": "..." },
    "theme": { "primaryColor": "...", "accentColor": "...", "borderRadius": "..." },
    "contact": { "phone": "...", "email": "...", "address": "...", "workingHours": "..." },
    "features": { "chatbot": true, "gallery": true, "..." : "..." },
    "layout": { "homepage": ["hero", "about", "..."] },
    "seo": { "metaTitle": "...", "robots": "index,follow", "canonicalUrl": "..." },
    "lead": { "formTitle": "...", "requiredFields": ["name","phone"], "successMessage": "..." },
    "project": { "defaultView": "grid", "showPrice": true, "..." : "..." },
    "sections_config": {
      "hero": { "enabled": true, "title": "...", "backgroundImage": "..." },
      "property-list": { "enabled": true, "limit": 6, "sort": "price_desc" },
      "gallery": { "enabled": true, "layout": "grid" },
      "...": { "enabled": true }
    },
    "meta": {
      "configVersion": 3,
      "loadedAt": "2026-04-25T00:36:00+03:00"
    },
    "project_data": { "id": 1, "name": "...", "status": "selling" },
    "sections": { "hero": {}, "about": {}, "..." : {} }
  }
}
```

> **V4 addition**: `sections_config` — merged section configs with defaults + feature toggles applied.
> `sections` (V1) still present for backward compatibility.

---

## 🎨 CSS Variable Mapping

Theme config values are mapped to CSS custom properties by `SiteService.applyTheme()`:

| Config Key | CSS Variable | Usage |
|------------|-------------|-------|
| `primaryColor` | `--color-primary` | Buttons, links, highlights |
| `secondaryColor` | `--color-secondary` | Secondary buttons, accents |
| `backgroundColor` | `--bg-primary` | Page background |
| `textColor` | `--text-primary` | Body text |
| `accentColor` | `--color-accent` | Badges, tags, hover states |
| `borderColor` | `--border-color` | Card borders, dividers |
| `mutedColor` | `--color-muted` | Placeholders, disabled text |
| `borderRadius` | `--border-radius` | Cards, buttons, inputs |
| `fontFamily` | `font-family` | Global typography |

---

## 🛡️ Validation Rules

### Theme
- Colors (`primaryColor`, `secondaryColor`, `backgroundColor`, `textColor`, `accentColor`): valid HEX (`#RRGGBB`)
- `borderColor`: HEX or `rgba(...)` allowed
- `borderRadius`: optional, CSS value (e.g., `12px`, `0.5rem`)

### Lead
- `rateLimit`: positive integer (1–100)
- `requiredFields`: must be array
- `notifyEmail`: valid email if present
- `webhookUrl`: valid URL if present

### SEO
- `metaTitle`: ⚠️ warning if > 70 chars
- `metaDescription`: ⚠️ warning if > 160 chars
- `robots`: one of `index,follow` | `noindex,follow` | `index,nofollow` | `noindex,nofollow`

### Site
- `site_key`: unique, lowercase `a-z0-9-` only
- `domain`: unique
- `name`: required

### Sections (V4)
- `enabled`: must be boolean
- `limit`: must be positive integer
- `sort`: one of `price_desc`, `price_asc`, `newest`
- `layout` (gallery): one of `grid`, `masonry`, `carousel`
- Unknown section keys: silently ignored

---

## 📐 Database Schema

### sites
```sql
CREATE TABLE sites (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  site_key        VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  domain          VARCHAR(200),
  -- LEGACY columns (fallback only, source of truth is site_configs)
  logo_url        VARCHAR(500),       -- TODO: drop after migration
  primary_color   VARCHAR(7),         -- TODO: drop after migration
  secondary_color VARCHAR(7),         -- TODO: drop after migration
  phone           VARCHAR(30),        -- TODO: drop after migration
  email           VARCHAR(200),       -- TODO: drop after migration
  is_active       TINYINT(1) DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### site_configs (V3)
```sql
CREATE TABLE site_configs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  site_id        INT UNSIGNED NOT NULL,
  config_key     VARCHAR(50) NOT NULL,
  config_value   JSON NOT NULL,
  config_version INT UNSIGNED NOT NULL DEFAULT 1,  -- V3: auto-increments on save
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (site_id, config_key),
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

### projects
```sql
CREATE TABLE projects (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  site_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(200) NOT NULL,
  location    VARCHAR(300),
  description TEXT,
  hero_image  VARCHAR(500),
  slogan      VARCHAR(300),
  status      ENUM('selling','upcoming','sold_out') DEFAULT 'selling',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);
```

### properties
```sql
CREATE TABLE properties (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id  INT UNSIGNED NOT NULL,
  title       VARCHAR(250) NOT NULL,
  price       DECIMAL(15,2) NOT NULL DEFAULT 0,
  area        DECIMAL(10,2),
  bedrooms    TINYINT UNSIGNED,
  bathrooms   TINYINT UNSIGNED,
  floor       VARCHAR(20),
  direction   VARCHAR(30),
  description TEXT,
  lat         DECIMAL(10,8),
  lng         DECIMAL(11,8),
  is_featured TINYINT(1) DEFAULT 0,
  status      ENUM('available','reserved','sold') DEFAULT 'available',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
```

---

## 📁 File Structure

```
bds/
├── api/
│   ├── sites/
│   │   ├── by-key.php
│   │   └── by-domain.php
│   ├── admin/
│   │   ├── sites.php
│   │   └── config.php
│   └── ai/
│       └── extract-colors.php
├── core/
│   ├── services/
│   │   ├── SiteService.php
│   │   └── SiteConfigService.php  ← V4: DEFAULT_SECTIONS, getMergedSections(), validateSections()
│   └── config/
│       └── db.php
├── database/
│   ├── seed.sql
│   ├── migration_v2_site_configs.sql
│   ├── migration_v3_config_cleanup.sql
│   └── migration_v4_sections_config.sql  ← NEW: page builder seed data
├── frontend/src/app/
│   ├── core/
│   │   ├── models/interfaces.ts  ← V4: SectionConfig, SectionsConfigMap
│   │   ├── services/
│   │   │   ├── site.service.ts
│   │   │   ├── admin.service.ts
│   │   │   └── ai-theme.service.ts
│   │   └── constants/
│   │       └── theme-presets.ts
│   └── features/
│       ├── admin/pages/
│       │   ├── sites.component.ts   ← V4: sectionsData, Sections tab
│       │   ├── sites.component.html ← V4: expandable section editors
│       │   └── sites.component.css  ← V4: cfg-section-card styles
│       └── landing/components/
│           └── landing.component.ts ← V4: isSectionEnabled(), getSectionConfig()
└── docs/
    └── sites-config-spec.md  ← This file
```

---

## ✅ V4 Migration Changelog

| Before (V3) | After (V4) | Task |
|-------------|------------|------|
| 8 config groups | **9** config groups (+ `sections`) ✅ | T1 |
| No section-level config | Per-section enabled/title/settings ✅ | T1,T3 |
| PHP: no section merge | `getMergedSections()` + `DEFAULT_SECTIONS` ✅ | T2,T3 |
| Angular: hardcoded section checks | `isSectionEnabled()` + `getSectionConfig()` ✅ | T4 |
| Admin: 9 tabs | **10 tabs** (+ Sections with expandable editors) ✅ | T5 |
| API: no sections_config | `sections_config` in response ✅ | T6 |
| Feature toggle + section: separate | Unified: features → section.enabled ✅ | T7 |
| No section validation | `validateSections()` in PHP ✅ | T8 |
| Layout only ordering | Layout ordering + section config = **page builder** ✅ | T9 |

## ✅ V3 Migration Changelog

| Before (V1/V2) | After (V3) | Task |
|-----------------|------------|------|
| Domain: `reverside.batdongsanuytin.com` | `riverside.batdongsanuytin.com` ✅ | T1 |
| Email: `info@reverside.vn` | `info@riverside.vn` ✅ | T1 |
| Logo: `/uploads/duana/logo.png` | `/uploads/riverside/logo.png` ✅ | T1 |
| Dual source: sites + site_configs | site_configs = source of truth ✅ | T2 |
| API: `by-domain.php?site_key=` only | + `by-key.php` + `?domain=` ✅ | T3 |
| Layout: ambiguous (config vs sections) | Config primary, sections fallback ✅ | T4 |
| Theme: 5 fields | 10 fields (+ semantic tokens) ✅ | T5 |
| SEO: 4 fields | 7 fields (+ canonical, robots, schema) ✅ | T6 |
| Lead: 6 fields | 10 fields (+ webhook, success msg) ✅ | T7 |
| No versioning | `config_version` column + `meta` in API ✅ | T8 |
| Admin: basic fields | + V3 fields in theme/SEO/lead tabs ✅ | T9 |
| No validation | PHP + Angular validation ✅ | T10 |

---

## ⚠️ Remaining TODOs

1. **Drop legacy columns** from `sites` after confirming all code paths use `site_configs`
2. **Remove `site_sections` fallback** after full layout migration
3. **Property images**: table exists but 0 records — need upload UI
4. **Leads**: no leads captured yet — test lead form submission
5. **Schema JSON**: SEO `schemaJson` field ready but no UI for editing
6. **Auto-assign**: Lead `autoAssign` field ready but no CRM integration
7. **Drag & drop**: Layout reorder UI ready (moveSection) but no DnD library yet
8. **Section templates**: `DEFAULT_SECTIONS` structure ready for reusable templates
9. **Section components @Input**: Components currently use SiteService injection; future: pass config as `@Input()` props
