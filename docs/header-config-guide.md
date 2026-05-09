# Header, Menu & Hero Banner — Hướng dẫn cấu hình

> Cập nhật: 2026-05-09
> Phiên bản: V5 (Navigation) + V4 (Section Config)

---

## 📐 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (Navbar)                                                │
│  [LOGO]      [Menu1] [Menu2 ▾] [Menu3] ...         [📞 CTA]    │
│                        ├─ SubMenu1                              │
│                        └─ SubMenu2                              │
├─────────────────────────────────────────────────────────────────┤
│  HERO BANNER                                                    │
│  [Badge: Đang mở bán]                                           │
│  Tiêu đề dự án                                                  │
│  Phụ đề / Mô tả ngắn                                           │
│  📍 Vị trí                                                      │
│  [Đăng ký tư vấn]  [📞 Gọi ngay]                               │
│  [100+ Căn hộ] [5★ Tiện ích] [24/7 An ninh]                    │
└─────────────────────────────────────────────────────────────────┘
```

### Config Groups tham gia

| Vùng | Config Group | Quản lý tại |
|------|-------------|-------------|
| Logo | `branding` | Admin → Sites → Tab Thương hiệu |
| Menu | `navigation` | Admin → Sites → Tab Menu |
| CTA điện thoại (Navbar) | `contact` | Admin → Sites → Tab Liên hệ |
| Hero Banner | `sections.hero` | Admin → Page Builder → Hero Banner |

---

## 1. 🖼️ Logo (Branding)

### Config Group: `branding`

```json
{
  "logoUrl": "/uploads/riverside/logo.png",
  "faviconUrl": "/uploads/riverside/favicon.ico",
  "siteName": "Dự Án Riverside"
}
```

### Logic hiển thị

```
Có logoUrl?
  ├── ✅ Hiện ảnh <img>
  └── ❌ Hiện text = siteName → site.name → "BDS"
```

### Quy cách logo

| Thuộc tính | Khuyến nghị |
|-----------|-------------|
| Chiều cao | 36–48px (auto width) |
| Format | PNG (trong suốt) hoặc SVG |
| Nền | Transparent (header trong suốt) |
| Đường dẫn | `/uploads/{site_key}/logo.png` |

---

## 2. 📋 Menu (Navigation)

### Config Group: `navigation`

Menu hỗ trợ **2 cấp** (parent/child) với drag & drop sắp xếp.

### Quản lý: Admin → Sites → Tab "📋 Menu"

| Tính năng | Mô tả |
|-----------|-------|
| Thêm menu | Nhấn "➕ Thêm menu", nhập label → key tự sinh |
| Thêm menu con | Nhấn ➕ trên menu cha, child hiện thụt vào bên dưới |
| Sắp xếp | Kéo thả (CDK Drag & Drop) cả cấp 1 và cấp 2 |
| Ẩn/hiện | Toggle 👁️ — menu ẩn vẫn lưu nhưng không render |
| Sửa/Xóa | ✏️ sửa inline, 🗑️ xóa (kèm xóa menu con) |
| Xem trước | Preview navbar realtime ở cuối form |

### Cấu trúc JSON

```json
{
  "items": [
    {
      "key": "about",
      "label": "Giới thiệu",
      "anchor": "#section-about",
      "icon": "🏠",
      "visible": true,
      "parentId": 0,
      "sortOrder": 0
    },
    {
      "key": "sub-item-1",
      "label": "Tổng quan",
      "anchor": "#section-overview",
      "parentId": 1,
      "sortOrder": 1
    }
  ]
}
```

### Trường mỗi menu item

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|--------|
| `key` | string | ✅ | Định danh duy nhất (auto-gen từ label) |
| `label` | string | ✅ | Text hiển thị trên menu |
| `anchor` | string | ✅ | `#section-xxx` (anchor) hoặc `https://...` (link ngoài) |
| `icon` | string | ❌ | Emoji icon (hiện trên mobile) |
| `visible` | boolean | ❌ | Ẩn/hiện (mặc định: `true`) |
| `parentId` | number | ❌ | `0` = cấp 1, `>0` = con của item tại index (1-based) |
| `sortOrder` | number | ❌ | Thứ tự hiển thị (auto-assign khi drag & drop) |

### Hệ thống phân cấp (ParentId)

```
parentId = 0  →  Menu cấp 1 (hiện trên navbar)
parentId = N  →  Menu con của item thứ N (1-based index)

Ví dụ: items[0] = "Giới thiệu" (parentId=0)
        items[1] = "Tổng quan"  (parentId=1) → con của "Giới thiệu"
        items[2] = "Đội ngũ"    (parentId=1) → con của "Giới thiệu"
```

### Hiển thị frontend

| Nền tảng | Menu cấp 1 | Menu cấp 2 (con) |
|----------|-----------|------------------|
| Desktop | Nút trên navbar | Dropdown glassmorphism khi hover |
| Mobile | Fullscreen overlay | Accordion mở khi click, chevron ▾ xoay |

### Ví dụ tuỳ chỉnh

**Ẩn menu:**
```json
{ "key": "gallery", "label": "Thư viện", "anchor": "#section-gallery", "visible": false }
```

**Đổi tên:**
```json
{ "key": "properties", "label": "Căn hộ & Giá", "anchor": "#section-properties" }
```

**Link ngoài:**
```json
{ "key": "blog", "label": "Blog", "anchor": "https://blog.riverside.vn", "icon": "📝" }
```

---

## 3. 🖼️ Hero Banner

### Config Source: `sections_config.hero` (Page Builder)

Toàn bộ Hero Banner được config trong **Page Builder** (`/admin/builder?site_id=X`).

### Quản lý: Admin → Page Builder → Chọn "Hero Banner"

### Các trường cấu hình

| Trường | Kiểu | Mặc định | Mô tả |
|--------|------|----------|--------|
| `title` | text | `''` | Tiêu đề chính |
| `subtitle` | text | `''` | Phụ đề |
| `backgroundImage` | image | `''` | Ảnh nền (upload/URL) |
| `backgroundColor` | color | `''` | Màu nền (fallback khi không có ảnh) |
| `status` | select | `'selling'` | Trạng thái badge: `selling` / `upcoming` / `sold_out` |
| `location` | text | `''` | Vị trí dự án (📍) |
| `ctaText` | text | `'Liên hệ tư vấn'` | Nút CTA chính |
| `ctaLink` | text | `'#section-contact'` | Link CTA |
| `ctaPhone` | text | `''` | Số điện thoại cho nút "Gọi ngay" |
| `stat1Value` | text | `'100+'` | Stat 1 — Giá trị |
| `stat1Label` | text | `'Căn hộ'` | Stat 1 — Nhãn |
| `stat2Value` | text | `'5★'` | Stat 2 — Giá trị |
| `stat2Label` | text | `'Tiện ích'` | Stat 2 — Nhãn |
| `stat3Value` | text | `'24/7'` | Stat 3 — Giá trị |
| `stat3Label` | text | `'An ninh'` | Stat 3 — Nhãn |

### Status badge mapping

| Giá trị | Hiển thị | Màu badge |
|---------|----------|-----------|
| `selling` | Đang mở bán | 🟢 Xanh (secondary) |
| `upcoming` | Sắp ra mắt | 🟢 Xanh (secondary) |
| `sold_out` | Đã bán hết | 🟢 Xanh (secondary) |

### Fallback chain

| Dữ liệu | Ưu tiên 1 (V4 — Page Builder) | Ưu tiên 2 (V1 — Legacy) |
|----------|-------------------------------|-------------------------|
| Status | `sections_config.hero.status` | `project.status` |
| Location | `sections_config.hero.location` | `project.location` |
| CTA Phone | `sections_config.hero.ctaPhone` | `contact.phone` → `site.phone` |
| Stats | `sections_config.hero.stat*` | Giá trị mặc định cứng |

---

## 4. 📞 CTA Navbar

### Config Group: `contact`

```json
{
  "phone": "0909 123 456",
  "email": "info@riverside.vn",
  "address": "Quận 2, TP.HCM",
  "workingHours": "8:00 - 20:00 (T2 - CN)"
}
```

Nút CTA trên navbar chỉ hiện khi `contact.phone` có giá trị.

---

## 5. 🔄 Luồng dữ liệu

```
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
│  site_configs table (JSON key-value)                     │
│  ├── branding    → logoUrl, siteName                     │
│  ├── navigation  → items[] (menu 2 cấp)                 │
│  ├── contact     → phone                                 │
│  └── sections    → hero (title, status, stats, ...)      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               PHP Backend (API)                          │
│  SiteConfigService.getPublicConfig()                     │
│  ├── Merge defaults + stored values                      │
│  ├── getMergedSections() → sections_config               │
│  └── Fallback: sites table → branding/contact            │
└────────────────────────┬────────────────────────────────┘
                         │  GET /api/sites/by-domain.php
                         ▼
┌─────────────────────────────────────────────────────────┐
│             Angular Frontend                             │
│  SiteService.config$                                     │
│  ├── NavbarComponent                                     │
│  │   ├── Logo:  branding.logoUrl || site.logo_url        │
│  │   ├── Menu:  navigation.items[] || auto from layout   │
│  │   └── CTA:   contact.phone || site.phone              │
│  └── HeroComponent                                       │
│      └── Data:  sections_config.hero || sections.hero    │
└─────────────────────────────────────────────────────────┘
```

### ⚠️ Lưu ý quan trọng: `sections` vs `sections_config`

| Key | Source | Mô tả |
|-----|--------|--------|
| `sections` | Bảng `site_sections` (V1 cũ) | Dữ liệu gốc, **KHÔNG CÓ** các trường mới |
| `sections_config` | Bảng `site_configs` key=`sections` (V4 — Page Builder) | Dữ liệu merged đầy đủ, **CÓ** tất cả trường mới |

**Khi viết component mới**, luôn đọc từ `sections_config` trước:
```typescript
get hero(): any {
  return this.siteService.config?.sections_config?.['hero']
    || this.siteService.config?.sections?.hero;
}
```

---

## 6. 📁 File liên quan

### Backend (PHP)

| File | Vai trò |
|------|---------|
| `core/services/SiteConfigService.php` | CRUD config, merge defaults, public API builder |
| `core/services/SiteService.php` | `getFullSiteConfigV2()` → gọi `getPublicConfig()` |
| `api/sites/by-domain.php` | Public API endpoint cho frontend |

### Frontend (Angular)

| File | Vai trò |
|------|---------|
| `core/models/interfaces.ts` | `NavigationItem`, `NavigationConfig`, `SiteConfig` |
| `core/constants/section-templates.ts` | Hero schema (15 fields) |
| `core/services/site.service.ts` | Config state management |
| `features/landing/components/navbar/*` | Navbar với dropdown 2 cấp |
| `features/landing/components/hero/*` | Hero Banner (config-driven) |
| `features/admin/pages/sites.component.*` | Tab "📋 Menu" quản lý |
| `features/admin/pages/page-builder.*` | Hero config editing |

---

## 7. ⚡ SQL Quick Reference

### Cập nhật logo
```sql
UPDATE site_configs
SET config_value = JSON_SET(config_value,
  '$.logoUrl', '/uploads/riverside/logo.png',
  '$.siteName', 'Dự Án Riverside'
)
WHERE site_id = 1 AND config_key = 'branding';
```

### Thêm menu 2 cấp
```sql
INSERT INTO site_configs (site_id, config_key, config_value, config_version)
VALUES (1, 'navigation', '{
  "items": [
    {"key":"about","label":"Giới thiệu","anchor":"#section-about","parentId":0,"sortOrder":0},
    {"key":"overview","label":"Tổng quan","anchor":"#section-about","parentId":1,"sortOrder":1},
    {"key":"team","label":"Đội ngũ","anchor":"#section-team","parentId":1,"sortOrder":2},
    {"key":"properties","label":"Bảng giá","anchor":"#section-properties","parentId":0,"sortOrder":3},
    {"key":"gallery","label":"Thư viện","anchor":"#section-gallery","parentId":0,"sortOrder":4},
    {"key":"contact","label":"Liên hệ","anchor":"#section-contact","parentId":0,"sortOrder":5}
  ]
}', 1)
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), config_version = config_version + 1;
```

### Cập nhật Hero Banner
```sql
UPDATE site_configs
SET config_value = JSON_SET(config_value,
  '$.hero.status', 'selling',
  '$.hero.location', 'Quận 2, TP.HCM',
  '$.hero.ctaPhone', '0909 123 456',
  '$.hero.stat1Value', '200+',
  '$.hero.stat1Label', 'Căn hộ'
)
WHERE site_id = 1 AND config_key = 'sections';
```

### Cập nhật số điện thoại CTA
```sql
UPDATE site_configs
SET config_value = JSON_SET(config_value, '$.phone', '0909 123 456')
WHERE site_id = 1 AND config_key = 'contact';
```
