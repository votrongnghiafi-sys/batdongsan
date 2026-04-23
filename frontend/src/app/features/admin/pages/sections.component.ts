import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-sections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (msg) {
      <div class="a-alert" [class]="msgType === 'ok' ? 'a-alert--ok' : 'a-alert--err'">{{ msg }}</div>
    }

    <!-- Site Selector -->
    <div class="a-card">
      <div class="a-card__head"><span class="a-card__title">🌐 Chọn Site</span></div>
      <div style="padding:1rem 1.25rem;display:flex;gap:.5rem;flex-wrap:wrap">
        @for (s of allSites; track s.id) {
          <button class="a-btn" [class]="s.id === selectedSiteId ? 'a-btn--primary' : 'a-btn--ghost'" (click)="selectSite(s.id)">{{ s.name }}</button>
        }
      </div>
    </div>

    @if (selectedSiteId) {
      <!-- Project -->
      <div class="a-card">
        <div class="a-card__head"><span class="a-card__title">📦 Thông tin Dự án</span></div>
        <form class="a-form" (ngSubmit)="saveProject()">
          <div class="a-fg"><label class="a-lbl">Tên dự án</label><input class="a-input" [(ngModel)]="project.name" name="pn" required></div>
          <div class="a-fg"><label class="a-lbl">Vị trí</label><input class="a-input" [(ngModel)]="project.location" name="pl"></div>
          <div class="a-fg a-fg--full"><label class="a-lbl">Mô tả</label><textarea class="a-ta" [(ngModel)]="project.description" name="pd"></textarea></div>
          <div class="a-fg"><label class="a-lbl">Hero Image URL</label><input class="a-input" [(ngModel)]="project.hero_image" name="phi"></div>
          <div class="a-fg"><label class="a-lbl">Hero Tagline</label><input class="a-input" [(ngModel)]="project.hero_tagline" name="pht"></div>
          <div class="a-fg">
            <label class="a-lbl">Trạng thái</label>
            <select class="a-select" [(ngModel)]="project.status" name="ps">
              <option value="upcoming">Sắp mở bán</option>
              <option value="selling">Đang mở bán</option>
              <option value="sold_out">Đã bán hết</option>
            </select>
          </div>
          <div class="a-actions"><button type="submit" class="a-btn a-btn--primary">Lưu dự án</button></div>
        </form>
      </div>

      <!-- Section editor -->
      <div class="a-card">
        <div class="a-card__head"><span class="a-card__title">{{ editSectionId ? '✏️ Chỉnh sửa Section' : '➕ Thêm Section' }}</span></div>
        <form class="a-form" (ngSubmit)="saveSection()">
          <div class="a-fg">
            <label class="a-lbl">Section Key</label>
            <select class="a-select" [(ngModel)]="secForm.section_key" name="sk" (change)="fillTemplate()">
              <option value="">— Chọn —</option>
              <option value="hero">Hero</option>
              <option value="about">About</option>
              <option value="amenities">Amenities</option>
              <option value="gallery">Gallery</option>
              <option value="location">Location</option>
              <option value="contact">Contact</option>
            </select>
          </div>
          <div class="a-fg"><label class="a-lbl">Thứ tự</label><input class="a-input" type="number" [(ngModel)]="secForm.sort_order" name="so"></div>
          <div class="a-fg a-fg--full">
            <label class="a-lbl">Nội dung (JSON)</label>
            <textarea class="a-ta" [(ngModel)]="secForm.content" name="sc" style="min-height:180px;font-family:monospace;font-size:.82rem"></textarea>
            <small style="color:rgba(240,240,245,.25);font-size:.75rem">💡 Chọn Section Key rồi JSON mẫu sẽ được điền tự động</small>
          </div>
          <div class="a-fg">
            <label class="a-lbl" style="display:flex;align-items:center;gap:.5rem"><input type="checkbox" [(ngModel)]="secForm.is_active" name="sa"> Kích hoạt</label>
          </div>
          <div class="a-actions">
            @if (editSectionId) { <button type="button" class="a-btn a-btn--ghost" (click)="cancelEditSection()">Hủy</button> }
            <button type="submit" class="a-btn a-btn--primary">{{ editSectionId ? 'Cập nhật' : 'Thêm' }}</button>
          </div>
        </form>
      </div>

      <!-- Sections list -->
      <div class="a-card">
        <div class="a-card__head"><span class="a-card__title">Sections ({{ sections.length }})</span></div>
        @if (!sections.length) {
          <div class="a-empty"><div class="a-empty__icon">📄</div><p>Chưa có section</p></div>
        } @else {
          <table class="a-table">
            <thead><tr><th>Thứ tự</th><th>Key</th><th>Preview</th><th>TT</th><th>Hành động</th></tr></thead>
            <tbody>
              @for (sec of sections; track sec.id) {
                <tr>
                  <td>{{ sec.sort_order }}</td>
                  <td><strong>{{ sec.section_key }}</strong></td>
                  <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.5;font-size:.8rem">{{ getPreview(sec) }}</td>
                  <td><span class="a-badge" [class]="sec.is_active ? 'a-badge--ok' : 'a-badge--muted'">{{ sec.is_active ? 'On' : 'Off' }}</span></td>
                  <td>
                    <button class="a-btn a-btn--ghost a-btn--sm" (click)="editSection(sec)">✏️</button>
                    <button class="a-btn a-btn--danger a-btn--sm" (click)="removeSection(sec)">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }
  `,
})
export class AdminSectionsComponent implements OnInit {
  private admin = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  allSites: any[] = [];
  selectedSiteId = 0;
  project: any = {};
  sections: any[] = [];
  editSectionId = 0;
  msg = '';
  msgType = '';
  secForm: any = this.emptySecForm();

  templates: Record<string, string> = {
    hero: '{\n  "title": "Tên dự án",\n  "subtitle": "Tagline",\n  "backgroundImage": "/uploads/hero.jpg",\n  "ctaText": "Đăng ký tư vấn",\n  "ctaPhone": "0909 xxx xxx"\n}',
    about: '{\n  "title": "Về dự án",\n  "description": "Mô tả...",\n  "highlights": ["Đặc điểm 1", "Đặc điểm 2"]\n}',
    amenities: '{\n  "title": "Tiện ích",\n  "items": [{"icon": "pool", "name": "Hồ bơi", "description": "Mô tả..."}]\n}',
    gallery: '{\n  "title": "Thư viện",\n  "images": ["/uploads/gallery-1.jpg"]\n}',
    location: '{\n  "title": "Vị trí",\n  "description": "Mô tả...",\n  "mapCenter": {"lat": 10.787, "lng": 106.747},\n  "nearby": [{"name": "Nơi gần", "distance": "5 phút"}]\n}',
    contact: '{\n  "title": "Liên hệ",\n  "subtitle": "Subtitle",\n  "phone": "0909 xxx xxx",\n  "email": "info@domain.vn",\n  "address": "Địa chỉ",\n  "workingHours": "8:00 - 20:00"\n}',
  };

  emptySecForm() { return { section_key: '', content: '', sort_order: 0, is_active: true }; }

  ngOnInit() {
    this.admin.getSites().subscribe(sites => {
      this.allSites = sites;
      if (sites.length) this.selectSite(sites[0].id);
      this.cdr.detectChanges();
    });
  }

  selectSite(id: number) {
    this.selectedSiteId = id;
    this.editSectionId = 0;
    this.secForm = this.emptySecForm();
    this.admin.getSections(id).subscribe(d => {
      this.sections = d.sections || [];
      this.project = d.project || {};
      this.secForm.sort_order = this.sections.length + 1;
      this.cdr.detectChanges();
    });
  }

  saveProject() {
    this.admin.saveProject({ ...this.project, site_id: this.selectedSiteId }).subscribe(() => {
      this.msg = 'Đã lưu dự án!'; this.msgType = 'ok'; this.cdr.detectChanges();
    });
  }

  saveSection() {
    const payload = { ...this.secForm, site_id: this.selectedSiteId, id: this.editSectionId || undefined };
    this.admin.saveSection(payload).subscribe({
      next: () => { this.msg = this.editSectionId ? 'Đã cập nhật!' : 'Đã thêm!'; this.msgType = 'ok'; this.cancelEditSection(); this.selectSite(this.selectedSiteId); },
      error: (e: any) => { this.msg = e?.error?.error || 'Lỗi!'; this.msgType = 'err'; this.cdr.detectChanges(); },
    });
  }

  editSection(sec: any) {
    this.editSectionId = sec.id;
    this.secForm = { section_key: sec.section_key, content: sec.content, sort_order: sec.sort_order, is_active: !!sec.is_active };
    try { this.secForm.content = JSON.stringify(JSON.parse(sec.content), null, 2); } catch {}
    this.cdr.detectChanges();
  }

  cancelEditSection() { this.editSectionId = 0; this.secForm = this.emptySecForm(); this.secForm.sort_order = this.sections.length + 1; this.cdr.detectChanges(); }

  removeSection(sec: any) {
    if (!confirm(`Xóa section "${sec.section_key}"?`)) return;
    this.admin.deleteSection(sec.id, this.selectedSiteId).subscribe(() => { this.msg = 'Đã xóa!'; this.msgType = 'ok'; this.selectSite(this.selectedSiteId); });
  }

  fillTemplate() {
    if (this.secForm.section_key && !this.secForm.content.trim() && this.templates[this.secForm.section_key]) {
      this.secForm.content = this.templates[this.secForm.section_key];
    }
  }

  getPreview(sec: any): string {
    try { const d = JSON.parse(sec.content); return d.title || sec.content.substring(0, 60); } catch { return sec.content?.substring(0, 60) || ''; }
  }
}
