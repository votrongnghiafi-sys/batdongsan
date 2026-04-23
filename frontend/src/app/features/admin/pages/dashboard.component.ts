import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="a-stats">
      <div class="a-stat">
        <div class="a-stat__icon">🌐</div>
        <div class="a-stat__val">{{ data?.stats?.sites || 0 }}</div>
        <div class="a-stat__lbl">Sites</div>
      </div>
      <div class="a-stat">
        <div class="a-stat__icon">🏠</div>
        <div class="a-stat__val">{{ data?.stats?.properties || 0 }}</div>
        <div class="a-stat__lbl">Sản phẩm</div>
      </div>
      <div class="a-stat">
        <div class="a-stat__icon">📩</div>
        <div class="a-stat__val">{{ data?.stats?.totalLeads || 0 }}</div>
        <div class="a-stat__lbl">Tổng leads</div>
      </div>
      <div class="a-stat">
        <div class="a-stat__icon">🔔</div>
        <div class="a-stat__val">{{ data?.stats?.unreadLeads || 0 }}</div>
        <div class="a-stat__lbl">Chưa đọc</div>
      </div>
    </div>

    <!-- Sites Table -->
    <div class="a-card">
      <div class="a-card__head">
        <span class="a-card__title">Sites đang hoạt động</span>
        <a routerLink="/admin/sites" class="a-btn a-btn--ghost a-btn--sm">Quản lý →</a>
      </div>
      <table class="a-table">
        <thead>
          <tr><th>Site Key</th><th>Tên</th><th>Màu</th><th>Projects</th><th>Leads</th><th>Trạng thái</th></tr>
        </thead>
        <tbody>
          @for (s of data?.sites; track s.id) {
            <tr>
              <td><strong>{{ s.site_key }}</strong></td>
              <td>{{ s.name }}</td>
              <td><span class="a-color" [style.background]="s.primary_color"></span> {{ s.primary_color }}</td>
              <td>{{ s.project_count }}</td>
              <td>{{ s.lead_count }}</td>
              <td><span class="a-badge" [class]="s.is_active ? 'a-badge--ok' : 'a-badge--muted'">{{ s.is_active ? 'Active' : 'Off' }}</span></td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Recent Leads -->
    <div class="a-card">
      <div class="a-card__head">
        <span class="a-card__title">Leads gần đây</span>
        <a routerLink="/admin/leads" class="a-btn a-btn--ghost a-btn--sm">Xem tất cả →</a>
      </div>
      @if (!data?.recentLeads?.length) {
        <div class="a-empty">
          <div class="a-empty__icon">📭</div>
          <p>Chưa có lead nào</p>
        </div>
      } @else {
        <table class="a-table">
          <thead><tr><th>Họ tên</th><th>SĐT</th><th>Site</th><th>Thời gian</th><th>Trạng thái</th></tr></thead>
          <tbody>
            @for (l of data?.recentLeads; track l.id) {
              <tr>
                <td><strong>{{ l.name }}</strong></td>
                <td>{{ l.phone }}</td>
                <td>{{ l.site_name }}</td>
                <td>{{ l.created_at }}</td>
                <td><span class="a-badge" [class]="l.is_read ? 'a-badge--muted' : 'a-badge--info'">{{ l.is_read ? 'Đã đọc' : 'Mới' }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private admin = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);
  data: any = null;

  ngOnInit() {
    this.admin.getDashboard().subscribe(d => { this.data = d; this.cdr.detectChanges(); });
  }
}
