import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { BuilderStateService, LayoutItem } from '../../../core/services/builder-state.service';
import { AdminService } from '../../../core/services/admin.service';
import { SECTION_TEMPLATES, SectionTemplate, SECTION_TEMPLATE_MAP } from '../../../core/constants/section-templates';
import { SiteConfigMap } from '../../../core/models/interfaces';

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.css',
})
export class PageBuilderComponent implements OnInit, OnDestroy {
  private builder = inject(BuilderStateService);
  private admin = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // State
  siteId = 0;
  siteName = '';
  layout: LayoutItem[] = [];
  selectedId: string | null = null;
  previewMode = false;
  saving = false;
  msg = '';
  msgType = '';
  showAddModal = false;

  // Templates
  readonly templates = SECTION_TEMPLATES;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    // Get site ID from query params
    this.route.queryParams.subscribe(params => {
      this.siteId = +(params['site_id'] || 0);
      if (this.siteId) {
        this.loadSiteConfig();
      }
    });

    // Subscribe to builder state
    this.subs.push(
      this.builder.layout$.subscribe(l => { this.layout = l; this.cdr.detectChanges(); }),
      this.builder.selectedId$.subscribe(id => { this.selectedId = id; this.cdr.detectChanges(); }),
      this.builder.previewMode$.subscribe(m => { this.previewMode = m; this.cdr.detectChanges(); }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ---------------------------------------------------------------
  // Load
  // ---------------------------------------------------------------

  private loadSiteConfig(): void {
    this.admin.getSites().subscribe(sites => {
      const site = sites.find((s: any) => s.id === this.siteId);
      if (site) this.siteName = site.name;
    });

    this.admin.getSiteConfigs(this.siteId).subscribe({
      next: (configs: SiteConfigMap) => {
        const homepage = (configs.layout as any)?.homepage || [];
        const sections = (configs as any).sections || {};
        this.builder.initFromConfig(homepage, sections);
        this.cdr.detectChanges();
      },
      error: () => {
        this.msg = 'Không thể tải cấu hình site.';
        this.msgType = 'err';
        this.cdr.detectChanges();
      },
    });
  }

  // ---------------------------------------------------------------
  // Drag & Drop
  // ---------------------------------------------------------------

  onDrop(event: CdkDragDrop<LayoutItem[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.builder.reorder(event.previousIndex, event.currentIndex);
    }
  }

  // ---------------------------------------------------------------
  // Section Actions
  // ---------------------------------------------------------------

  selectSection(id: string): void {
    this.builder.select(this.selectedId === id ? null : id);
  }

  addSection(type: string): void {
    const id = this.builder.addSection(type);
    if (id) {
      this.builder.select(id);
      this.showAddModal = false;
    } else {
      this.msg = 'Đã đạt giới hạn số lượng cho loại này.';
      this.msgType = 'err';
      setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
    }
    this.cdr.detectChanges();
  }

  duplicateSection(id: string, event: Event): void {
    event.stopPropagation();
    const newId = this.builder.duplicateSection(id);
    if (newId) {
      this.builder.select(newId);
    } else {
      this.msg = 'Không thể nhân bản (đã đạt giới hạn).';
      this.msgType = 'err';
      setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
    }
  }

  removeSection(id: string, event: Event): void {
    event.stopPropagation();
    const item = this.layout.find(i => i.id === id);
    const label = this.getTemplate(item?.type || '')?.label || id;
    if (confirm(`Xóa section "${label}"?`)) {
      this.builder.removeSection(id);
    }
  }

  toggleEnabled(id: string, event: Event): void {
    event.stopPropagation();
    this.builder.toggleSection(id);
  }

  // ---------------------------------------------------------------
  // Config Editing (Schema-driven)
  // ---------------------------------------------------------------

  updateField(id: string, field: string, value: unknown): void {
    this.builder.updateField(id, field, value);
  }

  getConfig(id: string): Record<string, unknown> {
    return this.builder.getSectionConfig(id);
  }

  getTemplate(type: string): SectionTemplate | undefined {
    return SECTION_TEMPLATE_MAP.get(type);
  }

  getSelectedTemplate(): SectionTemplate | undefined {
    if (!this.selectedId) return undefined;
    return this.builder.getTemplate(this.selectedId);
  }

  getSelectedConfig(): Record<string, unknown> {
    if (!this.selectedId) return {};
    return this.builder.getSectionConfig(this.selectedId);
  }

  isEnabled(id: string): boolean {
    return this.builder.isSectionEnabled(id);
  }

  /** Check if we can add more of this type */
  canAdd(type: string): boolean {
    const template = SECTION_TEMPLATE_MAP.get(type);
    if (!template || template.maxInstances === 0) return true;
    const count = this.layout.filter(i => i.type === type).length;
    return count < template.maxInstances;
  }

  // ---------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------

  save(): void {
    if (!this.siteId) return;
    this.saving = true;
    this.msg = '';

    const configs: any = {
      layout: { homepage: this.builder.exportLayoutV4() },
      sections: this.builder.exportSections(),
    };

    this.admin.updateSiteConfigs(this.siteId, configs).subscribe({
      next: () => {
        this.msg = 'Đã lưu thành công!';
        this.msgType = 'ok';
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.msg = 'Lỗi khi lưu!';
        this.msgType = 'err';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ---------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------

  goBack(): void {
    this.router.navigate(['/admin/sites']);
  }

  togglePreview(): void {
    this.builder.setPreviewMode(!this.previewMode);
  }

  /** Schema field entries for the selected section */
  get schemaEntries(): [string, any][] {
    const template = this.getSelectedTemplate();
    if (!template?.schema) return [];
    return Object.entries(template.schema);
  }
}
