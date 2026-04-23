import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (msg) {
      <div class="a-alert" [class]="msgType === 'ok' ? 'a-alert--ok' : 'a-alert--err'">{{ msg }}</div>
    }

    <!-- Filters -->
    <div class="a-filters">
      <button class="a-btn a-btn--sm" [class]="!filterSite && !filterStatus ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filter()">Tất cả</button>
      <button class="a-btn a-btn--sm" [class]="filterStatus==='unread' ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filter(0,'unread')">🔔 Chưa đọc</button>
      <button class="a-btn a-btn--sm" [class]="filterStatus==='read' ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filter(0,'read')">✅ Đã đọc</button>
      <span style="color:rgba(240,240,245,.2);padding:.3rem 0">|</span>
      @for (s of sites; track s.id) {
        <button class="a-btn a-btn--sm" [class]="filterSite===s.id ? 'a-btn--primary' : 'a-btn--ghost'" (click)="filter(s.id)">{{ s.site_key }}</button>
      }
      <button class="a-btn a-btn--ghost a-btn--sm" style="margin-left:auto" (click)="markAllRead()">✅ Đánh dấu tất cả đã đọc</button>
    </div>

    <div class="a-card">
      <div class="a-card__head"><span class="a-card__title">Leads ({{ leads.length }})</span></div>
      @if (!leads.length) {
        <div class="a-empty"><div class="a-empty__icon">📭</div><p>Không có lead nào</p></div>
      } @else {
        <table class="a-table">
          <thead><tr><th>ID</th><th>Họ tên</th><th>SĐT</th><th>Email</th><th>Site</th><th>Tin nhắn</th><th>Thời gian</th><th>TT</th><th>Hành động</th></tr></thead>
          <tbody>
            @for (l of leads; track l.id) {
              <tr [style.background]="!l.is_read ? 'rgba(10,132,255,.03)' : ''">
                <td>{{ l.id }}</td>
                <td><strong>{{ l.name }}</strong>{{ !l.is_read ? ' 🔴' : '' }}</td>
                <td style="color:#30D158">{{ l.phone }}</td>
                <td style="font-size:.8rem;opacity:.5">{{ l.email || '—' }}</td>
                <td><span class="a-badge a-badge--info">{{ l.site_key }}</span></td>
                <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.5;font-size:.8rem">{{ l.message || '—' }}</td>
                <td style="font-size:.8rem">{{ l.created_at }}</td>
                <td><span class="a-badge" [class]="l.is_read ? 'a-badge--muted' : 'a-badge--info'">{{ l.is_read ? 'Đã đọc' : 'Mới' }}</span></td>
                <td>
                  @if (!l.is_read) { <button class="a-btn a-btn--ghost a-btn--sm" (click)="markRead(l)">✅</button> }
                  <button class="a-btn a-btn--danger a-btn--sm" (click)="remove(l)">🗑️</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminLeadsComponent implements OnInit {
  private admin = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  leads: any[] = [];
  sites: any[] = [];
  filterSite = 0;
  filterStatus = '';
  msg = '';
  msgType = '';

  ngOnInit() { this.load(); }

  load() {
    this.admin.getLeads(this.filterSite || undefined, this.filterStatus || undefined).subscribe(d => {
      this.leads = d.leads; this.sites = d.sites; this.cdr.detectChanges();
    });
  }

  filter(siteId = 0, status = '') {
    this.filterSite = siteId;
    this.filterStatus = status;
    this.load();
  }

  markRead(l: any) {
    this.admin.markLeadRead(l.id).subscribe(() => { l.is_read = 1; this.cdr.detectChanges(); });
  }

  markAllRead() {
    this.admin.markAllLeadsRead(this.filterSite || undefined).subscribe(() => {
      this.msg = 'Đã đánh dấu tất cả đã đọc!'; this.msgType = 'ok'; this.load();
    });
  }

  remove(l: any) {
    if (!confirm('Xóa lead này?')) return;
    this.admin.deleteLead(l.id).subscribe(() => { this.msg = 'Đã xóa!'; this.msgType = 'ok'; this.load(); });
  }
}
