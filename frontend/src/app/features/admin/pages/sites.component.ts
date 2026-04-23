import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-sites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (msg) {
      <div class="a-alert" [class]="msgType === 'ok' ? 'a-alert--ok' : 'a-alert--err'">{{ msg }}</div>
    }

    <!-- Form -->
    <div class="a-card">
      <div class="a-card__head">
        <span class="a-card__title">{{ editId ? '✏️ Chỉnh sửa Site' : '➕ Tạo Site mới' }}</span>
      </div>
      <form class="a-form" (ngSubmit)="save()">
        <div class="a-fg">
          <label class="a-lbl">Site Key (subdomain)</label>
          <input class="a-input" [(ngModel)]="form.site_key" name="site_key" required placeholder="duana" pattern="[a-z0-9\\-]+">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Tên Site</label>
          <input class="a-input" [(ngModel)]="form.name" name="name" required placeholder="Dự Án Duana Riverside">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Domain</label>
          <input class="a-input" [(ngModel)]="form.domain" name="domain" placeholder="duana.domain.com">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Logo URL</label>
          <input class="a-input" [(ngModel)]="form.logo_url" name="logo_url" placeholder="/uploads/logo.png">
        </div>
        <div class="a-fg">
          <label class="a-lbl">SĐT</label>
          <input class="a-input" [(ngModel)]="form.phone" name="phone" placeholder="0909 123 456">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Email</label>
          <input class="a-input" [(ngModel)]="form.email" name="email" type="email">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Màu chính</label>
          <input class="a-input" [(ngModel)]="form.primary_color" name="primary_color" type="color" style="height:40px;padding:4px;">
        </div>
        <div class="a-fg">
          <label class="a-lbl">Màu phụ</label>
          <input class="a-input" [(ngModel)]="form.secondary_color" name="secondary_color" type="color" style="height:40px;padding:4px;">
        </div>
        <div class="a-fg">
          <label class="a-lbl" style="display:flex;align-items:center;gap:.5rem">
            <input type="checkbox" [(ngModel)]="form.is_active" name="is_active"> Kích hoạt
          </label>
        </div>
        <div class="a-actions">
          @if (editId) { <button type="button" class="a-btn a-btn--ghost" (click)="cancelEdit()">Hủy</button> }
          <button type="submit" class="a-btn a-btn--primary">{{ editId ? 'Cập nhật' : 'Tạo Site' }}</button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div class="a-card">
      <div class="a-card__head"><span class="a-card__title">Danh sách Sites ({{ sites.length }})</span></div>
      <table class="a-table">
        <thead><tr><th>ID</th><th>Key</th><th>Tên</th><th>Domain</th><th>Màu</th><th>Projects</th><th>Leads</th><th>TT</th><th>Hành động</th></tr></thead>
        <tbody>
          @for (s of sites; track s.id) {
            <tr>
              <td>{{ s.id }}</td>
              <td><strong>{{ s.site_key }}</strong></td>
              <td>{{ s.name }}</td>
              <td style="font-size:.8rem;opacity:.5">{{ s.domain }}</td>
              <td><span class="a-color" [style.background]="s.primary_color"></span> <span class="a-color" [style.background]="s.secondary_color" style="margin-left:4px"></span></td>
              <td>{{ s.project_count }}</td>
              <td>{{ s.lead_count }}</td>
              <td><span class="a-badge" [class]="s.is_active ? 'a-badge--ok' : 'a-badge--muted'">{{ s.is_active ? 'On' : 'Off' }}</span></td>
              <td>
                <button class="a-btn a-btn--ghost a-btn--sm" (click)="edit(s)">✏️</button>
                <button class="a-btn a-btn--danger a-btn--sm" (click)="remove(s)">🗑️</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class AdminSitesComponent implements OnInit {
  private admin = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  sites: any[] = [];
  editId = 0;
  msg = '';
  msgType = '';
  form: any = this.emptyForm();

  emptyForm() {
    return { site_key: '', name: '', domain: '', logo_url: '', phone: '', email: '', primary_color: '#0A84FF', secondary_color: '#30D158', is_active: true };
  }

  ngOnInit() { this.load(); }

  load() {
    this.admin.getSites().subscribe(s => { this.sites = s; this.cdr.detectChanges(); });
  }

  save() {
    const obs = this.editId
      ? this.admin.updateSite({ ...this.form, id: this.editId })
      : this.admin.createSite(this.form);
    obs.subscribe({
      next: () => { this.msg = this.editId ? 'Đã cập nhật!' : 'Đã tạo!'; this.msgType = 'ok'; this.cancelEdit(); this.load(); },
      error: () => { this.msg = 'Lỗi!'; this.msgType = 'err'; this.cdr.detectChanges(); },
    });
  }

  edit(s: any) {
    this.editId = s.id;
    this.form = { ...s, is_active: !!s.is_active };
    this.cdr.detectChanges();
  }

  cancelEdit() { this.editId = 0; this.form = this.emptyForm(); this.cdr.detectChanges(); }

  remove(s: any) {
    if (!confirm(`Xóa site "${s.site_key}" và TẤT CẢ dữ liệu?`)) return;
    this.admin.deleteSite(s.id).subscribe(() => { this.msg = 'Đã xóa!'; this.msgType = 'ok'; this.load(); });
  }
}
