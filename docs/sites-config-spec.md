# BDS Multi-Site — Full Site Configuration Spec

> Exported: 2026-04-24T21:00:00+03:00
> Database: `bds_multisite`

---

## 📊 Database Overview

| Table | Records | Purpose |
|-------|---------|---------|
| `sites` | 2 | Core site info (key, domain, colors) |
| `site_configs` | 16 | V2 JSON config (8 groups × 2 sites) |
| `projects` | 2 | Dự án bất động sản |
| `properties` | 11 | Bất động sản (6 + 5) |
| `property_images` | 0 | Ảnh BĐS |
| `site_sections` | 12 | Landing page sections (6 × 2) |
| `leads` | 0 | Form liên hệ |

---

## 🌐 Site #1: Riverside

### General

| Field | Value |
|-------|-------|
| ID | 1 |
| Site Key | `riverside` |
| Name | Dự Án Riverside |
| Domain | `reverside.batdongsanuytin.com` |
| Active | ✅ Yes |
| Created | 2026-04-22 19:10:53 |

### Branding

```json
{
  "logoUrl": "/uploads/duana/logo.png",
  "faviconUrl": "",
  "siteName": "Dự Án Riverside"
}
```

### Theme

```json
{
  "primaryColor": "#22C55E",
  "secondaryColor": "#14532D",
  "backgroundColor": "#F0FDF4",
  "textColor": "#052E16",
  "fontFamily": "Poppins"
}
```

> **Preset:** Fresh Minimal

### Contact

```json
{
  "phone": "0909 123 456",
  "email": "info@reverside.vn",
  "address": "Đường Nguyễn Thị Định, Quận 2, TP.HCM",
  "workingHours": "8:00 - 20:00 (T2 - CN)"
}
```

### Project Settings

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

### Lead Form

```json
{
  "formTitle": "Liên hệ tư vấn",
  "formSubtitle": "Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút",
  "requiredFields": ["name", "phone"],
  "enableHoneypot": true,
  "rateLimit": 5,
  "notifyEmail": "info@duana.vn"
}
```

### Features

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

### Layout

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

### SEO

```json
{
  "metaTitle": "Dự Án Riverside",
  "metaDescription": "Dự án bất động sản Dự Án Riverside - Thông tin chi tiết, bảng giá mới nhất.",
  "ogImage": "/uploads/duana/logo.png",
  "keywords": "Riverside"
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

### Sections (V1)

| Order | Section Key |
|-------|------------|
| 1 | hero |
| 2 | about |
| 3 | gallery |
| 4 | amenities |
| 5 | location |
| 6 | contact |

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

### Branding

```json
{
  "logoUrl": "/uploads/sunrise/logo.png",
  "faviconUrl": "",
  "siteName": "Sunrise City Apartments"
}
```

### Theme

```json
{
  "primaryColor": "#FF6B35",
  "secondaryColor": "#FFD23F",
  "backgroundColor": "#08080f",
  "textColor": "#f0f0f5",
  "fontFamily": "Inter"
}
```

> **Style:** Dark theme with vibrant orange + yellow

### Contact

```json
{
  "phone": "0912 456 789",
  "email": "hello@sunrise-city.vn",
  "address": "Đại lộ Nguyễn Văn Linh, Quận 7, TP.HCM",
  "workingHours": "8:00 - 21:00 (T2 - CN)"
}
```

### Project Settings

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

### Lead Form

```json
{
  "formTitle": "Liên hệ tư vấn",
  "formSubtitle": "Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút",
  "requiredFields": ["name", "phone"],
  "enableHoneypot": true,
  "rateLimit": 5,
  "notifyEmail": "hello@sunrise-city.vn"
}
```

### Features

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

### Layout

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

### SEO

```json
{
  "metaTitle": "Sunrise City Apartments",
  "metaDescription": "Dự án bất động sản Sunrise City Apartments - Thông tin chi tiết, bảng giá mới nhất.",
  "ogImage": "/uploads/sunrise/logo.png",
  "keywords": ""
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

### Sections (V1)

| Order | Section Key |
|-------|------------|
| 1 | hero |
| 2 | about |
| 3 | gallery |
| 4 | amenities |
| 5 | location |
| 6 | contact |

---

## ⚙️ Config Groups Schema

Each site has **8 config groups** stored in `site_configs` as JSON key-value pairs:

| Group | Key | Fields |
|-------|-----|--------|
| Branding | `branding` | logoUrl, faviconUrl, siteName |
| Theme | `theme` | primaryColor, secondaryColor, backgroundColor, textColor, fontFamily |
| Contact | `contact` | phone, email, address, workingHours |
| Project | `project` | defaultView, itemsPerPage, showPrice, showArea, showStatus, priceUnit |
| Lead | `lead` | formTitle, formSubtitle, requiredFields, enableHoneypot, rateLimit, notifyEmail |
| Features | `features` | chatbot, aiAnalysis, booking, gallery, propertyFilter, leadForm, map |
| Layout | `layout` | homepage (string[]) |
| SEO | `seo` | metaTitle, metaDescription, ogImage, keywords |

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sites/by-domain.php?site_key=riverside` | Public — full merged config |
| GET | `/api/admin/config.php?site_id=1` | Admin — all config groups |
| GET | `/api/admin/config.php?site_id=1&key=theme` | Admin — single group |
| PUT | `/api/admin/config.php` | Admin — batch update |
| POST | `/api/ai/extract-colors.php` | AI — image color extraction |

---

## 📐 Database Schema

### sites
```sql
CREATE TABLE sites (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  site_key      VARCHAR(50) UNIQUE NOT NULL,
  name          VARCHAR(200) NOT NULL,
  domain        VARCHAR(200),
  logo_url      VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  phone         VARCHAR(30),
  email         VARCHAR(200),
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### site_configs
```sql
CREATE TABLE site_configs (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  site_id      INT UNSIGNED NOT NULL,
  config_key   VARCHAR(50) NOT NULL,
  config_value JSON NOT NULL,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

## ⚠️ Known Issues

1. **Domain mismatch:** Site #1 domain in DB is `reverside.batdongsanuytin.com` but site_key is `riverside` — should update domain to `riverside.batdongsanuytin.com`
2. **Email mismatch:** Contact email `info@reverside.vn` should be `info@riverside.vn`
3. **Logo path:** Still using old `/uploads/duana/` path — should migrate to `/uploads/riverside/`
4. **Property images:** Table exists but has 0 records
5. **Leads:** No leads captured yet
