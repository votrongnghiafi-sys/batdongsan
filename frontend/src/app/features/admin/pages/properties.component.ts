import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (msg) {
      <div class="a-alert" [class]="msgType === 'ok' ? 'a-alert--ok' : 'a-alert--err'">{{ msg }}</div>
    }

    <!-- Form -->
    <div class="a-card">
      <div class="a-card__head"><span class="a-card__title">{{ editId ? '✏️ Chỉnh sửa' : '➕ Thêm Sản phẩm' }}</span></div>
      <form class="a-form" (ngSubmit)="save()">
        <div class="a-fg">
          <label class="a-lbl">Dự án</label>
          <select class="a-select" [(ngModel)]="form.project_id" name="pid" required>
            <option [ngValue]="0">— Chọn —</option>
            @for (p of projects; track p.id) {
              <option [ngValue]="p.id">[{{ p.site_key }}] {{ p.name }}</option>
            }
          </select>
        </div>
        <div class="a-fg"><label class="a-lbl">Tên sản phẩm</label><input class="a-input" [(ngModel)]="form.title" name="t" required placeholder="Biệt thự A01"></div>
        <div class="a-fg"><label class="a-lbl">Giá (VNĐ)</label><input class="a-input" type="number" [(ngModel)]="form.price" name="pr" step="100000"></div>
        <div class="a-fg"><label class="a-lbl">Diện tích (m²)</label><input class="a-input" type="number" [(ngModel)]="form.area" name="ar" step="0.1"></div>
        <div class="a-fg"><label class="a-lbl">Phòng ngủ</label><input class="a-input" type="number" [(ngModel)]="form.bedrooms" name="bd" min="0"></div>
        <div class="a-fg"><label class="a-lbl">Phòng tắm</label><input class="a-input" type="number" [(ngModel)]="form.bathrooms" name="bt" min="0"></div>
        <div class="a-fg"><label class="a-lbl">Tầng</label><input class="a-input" [(ngModel)]="form.floor" name="fl" placeholder="Trệt + 2 lầu"></div>
        <div class="a-fg"><label class="a-lbl">Hướng</label><input class="a-input" [(ngModel)]="form.direction" name="dir" placeholder="Đông Nam"></div>
        <div class="a-fg a-fg--full"><label class="a-lbl">Mô tả</label><textarea class="a-ta" [(ngModel)]="form.description" name="desc"></textarea></div>
        <div class="a-fg">
          <label class="a-lbl">Trạng thái</label>
          <select class="a-select" [(ngModel)]="form.status" name="st">
            <option value="available">Còn trống</option><option value="reserved">Giữ chỗ</option><option value="sold">Đã bán</option>
          </select>
        </div>
        <div class="a-fg">
          <label class="a-lbl" style="display:flex;align-items:center;gap:.5rem"><input type="checkbox" [(ngModel)]="form.is_featured" name="ft"> Nổi bật ⭐</label>
        </div>
        <div class="a-actions">
          @if (editId) { <button type="button" class="a-btn a-btn--ghost" (click)="cancelEdit()">Hủy</button> }
          <button type="submit" class="a-btn a-btn--primary">{{ editId ? 'Cập nhật' : 'Thêm' }}</button>
        </div>
      </form>
    </div>

    <!-- Filter & List -->
    <div class="a-filters">
      <button class="a-btn a-btn--sm" [class]="!filterProject ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filterBy(0)">Tất cả</button>
      @for (p of projects; track p.id) {
        <button class="a-btn a-btn--sm" [class]="filterProject === p.id ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filterBy(p.id)">[{{ p.site_key }}] {{ p.name }}</button>
      }
    </div>

    <div class="a-card">
      <div class="a-card__head"><span class="a-card__title">Sản phẩm ({{ properties.length }})</span></div>
      @if (!properties.length) {
        <div class="a-empty"><div class="a-empty__icon">🏠</div><p>Chưa có sản phẩm</p></div>
      } @else {
        <table class="a-table">
          <thead><tr><th>ID</th><th>Tên</th><th>Site</th><th>Giá</th><th>DT</th><th>PN</th><th>TT</th><th>Hành động</th></tr></thead>
          <tbody>
            @for (prop of properties; track prop.id) {
              <tr>
                <td>{{ prop.id }}</td>
                <td><strong>{{ prop.title }}</strong>{{ prop.is_featured ? ' ⭐' : '' }}</td>
                <td><span class="a-badge a-badge--info">{{ prop.site_key }}</span></td>
                <td style="font-weight:600;color:#30D158">{{ formatPrice(prop.price) }}</td>
                <td>{{ prop.area ? prop.area + 'm²' : '—' }}</td>
                <td>{{ prop.bedrooms ?? '—' }}</td>
                <td><span class="a-badge" [class]="statusBadge(prop.status)">{{ statusLabel(prop.status) }}</span></td>
                <td>
                  <button class="a-btn a-btn--ghost a-btn--sm" (click)="edit(prop)">✏️</button>
                  <button class="a-btn a-btn--danger a-btn--sm" (click)="remove(prop)">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminPropertiesComponent implements OnInit {
  private admin = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  properties: any[] = [];
  projects: any[] = [];
  editId = 0;
  filterProject = 0;
  msg = '';
  msgType = '';
  form: any = this.emptyForm();

  emptyForm() {
    return { project_id: 0, title: '', price: 0, area: null, bedrooms: null, bathrooms: null, floor: '', direction: '', description: '', is_featured: false, status: 'available' };
  }

  ngOnInit() { this.load(); }

  load(projectId?: number) {
    this.admin.getProperties(projectId).subscribe(d => {
      this.properties = d.properties; this.projects = d.projects; this.cdr.detectChanges();
    });
  }

  filterBy(pid: number) { this.filterProject = pid; this.load(pid || undefined); }

  save() {
    const obs = this.editId ? this.admin.updateProperty({ ...this.form, id: this.editId }) : this.admin.createProperty(this.form);
    obs.subscribe({
      next: () => { this.msg = this.editId ? 'Đã cập nhật!' : 'Đã thêm!'; this.msgType = 'ok'; this.cancelEdit(); this.load(this.filterProject || undefined); },
      error: () => { this.msg = 'Lỗi!'; this.msgType = 'err'; this.cdr.detectChanges(); },
    });
  }

  edit(p: any) { this.editId = p.id; this.form = { ...p, is_featured: !!p.is_featured }; this.cdr.detectChanges(); }
  cancelEdit() { this.editId = 0; this.form = this.emptyForm(); this.cdr.detectChanges(); }

  remove(p: any) {
    if (!confirm(`Xóa "${p.title}"?`)) return;
    this.admin.deleteProperty(p.id).subscribe(() => { this.msg = 'Đã xóa!'; this.msgType = 'ok'; this.load(this.filterProject || undefined); });
  }

  formatPrice(v: number): string {
    return v >= 1e9 ? (v / 1e9).toFixed(1) + ' tỷ' : (v / 1e6).toFixed(0) + ' triệu';
  }

  statusLabel(s: string) { return { available: 'Còn trống', reserved: 'Giữ chỗ', sold: 'Đã bán' }[s] || s; }
  statusBadge(s: string) { return { available: 'a-badge--ok', reserved: 'a-badge--warn', sold: 'a-badge--err' }[s] || 'a-badge--muted'; }
}
