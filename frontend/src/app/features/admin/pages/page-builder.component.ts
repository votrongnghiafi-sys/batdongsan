import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { BuilderStateService, LayoutItem } from '../../../core/services/builder-state.service';
import { AdminService } from '../../../core/services/admin.service';
import {
  SECTION_TEMPLATES,
  SectionTemplate,
  SectionCategory,
  SECTION_TEMPLATE_MAP,
  SECTION_CATEGORY_LABELS,
  getTemplatesByCategory,
} from '../../../core/constants/section-templates';
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
  resetting = false;
  msg = '';
  msgType = '';
  showAddModal = false;

  // V7: Upload state
  uploadingField: string | null = null;

  // V7: Confirm modal state
  confirmData: {
    show: boolean;
    icon: string;
    title: string;
    message: string;
    detail: string;
    confirmLabel: string;
    cancelLabel: string;
    type: 'warning' | 'danger';
    onConfirm: () => void;
  } = {
    show: false, icon: '', title: '', message: '', detail: '',
    confirmLabel: 'Xác nhận', cancelLabel: 'Hủy', type: 'warning',
    onConfirm: () => {},
  };

  // V6: Grouped layout for sidebar
  layoutGroups: { category: SectionCategory; label: string; items: LayoutItem[] }[] = [];

  // V6: Auto-draft
  draftTimestamp: string | null = null;
  private draftInterval: ReturnType<typeof setInterval> | null = null;

  // Templates
  readonly templates = SECTION_TEMPLATES;
  readonly categoryLabels = SECTION_CATEGORY_LABELS;

  // V6: Templates grouped by category for Add Modal
  readonly templatesByCategory = getTemplatesByCategory();

  private subs: Subscription[] = [];

  ngOnInit(): void {
    // Get site ID from query params
    this.route.queryParams.subscribe(params => {
      this.siteId = +(params['site_id'] || 0);
      if (this.siteId) {
        this.loadSiteConfig();
        this.startDraftTimer();
      }
    });

    // Subscribe to builder state
    this.subs.push(
      this.builder.layout$.subscribe(l => {
        this.layout = l;
        this.layoutGroups = this.builder.getLayoutGrouped();
        this.cdr.detectChanges();
      }),
      this.builder.selectedId$.subscribe(id => { this.selectedId = id; this.cdr.detectChanges(); }),
      this.builder.previewMode$.subscribe(m => { this.previewMode = m; this.cdr.detectChanges(); }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.draftInterval) {
      clearInterval(this.draftInterval);
    }
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
        const features = (configs as any).features || {};
        // V6: Pass features to initialize feature sections
        this.builder.initFromConfig(homepage, sections, features);
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
    this.showConfirm({
      icon: '🗑️',
      title: `Xóa "${label}"?`,
      message: 'Section này sẽ bị xóa khỏi layout.',
      detail: 'Bạn có thể thêm lại sau từ menu "Thêm".',
      confirmLabel: 'Xóa',
      type: 'danger',
      onConfirm: () => this.builder.removeSection(id),
    });
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
  // V6: Save (unified payload)
  // ---------------------------------------------------------------

  save(): void {
    if (!this.siteId) return;
    this.saving = true;
    this.msg = '';

    const { layout, sections, features } = this.builder.exportForSave();

    const configs: any = {
      layout,
      sections,
      features,
    };

    this.admin.updateSiteConfigs(this.siteId, configs).subscribe({
      next: () => {
        this.msg = 'Đã lưu thành công!';
        this.msgType = 'ok';
        this.saving = false;
        this.builder.clearDraft(this.siteId);
        this.draftTimestamp = null;
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

  // ---------------------------------------------------------------
  // V7: Confirm Modal
  // ---------------------------------------------------------------

  /** Show custom confirm modal */
  private showConfirm(opts: {
    icon: string; title: string; message: string; detail?: string;
    confirmLabel?: string; cancelLabel?: string; type?: 'warning' | 'danger';
    onConfirm: () => void;
  }): void {
    this.confirmData = {
      show: true,
      icon: opts.icon,
      title: opts.title,
      message: opts.message,
      detail: opts.detail || '',
      confirmLabel: opts.confirmLabel || 'Xác nhận',
      cancelLabel: opts.cancelLabel || 'Hủy',
      type: opts.type || 'warning',
      onConfirm: opts.onConfirm,
    };
    this.cdr.detectChanges();
  }

  /** Execute confirm action and close modal */
  onConfirmAccept(): void {
    this.confirmData.onConfirm();
    this.confirmData.show = false;
    this.cdr.detectChanges();
  }

  /** Cancel and close confirm modal */
  onConfirmCancel(): void {
    this.confirmData.show = false;
    this.cdr.detectChanges();
  }

  // ---------------------------------------------------------------
  // V7: File Upload
  // ---------------------------------------------------------------

  /** Trigger the hidden file input inside an upload zone */
  triggerFileInput(event: Event): void {
    const zone = event.currentTarget as HTMLElement;
    const input = zone.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.click();
  }

  /** Handle file selection from input */
  onFileSelect(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.uploadFile(input.files[0], fieldKey);
      input.value = ''; // Reset to allow re-upload of same file
    }
  }

  /** Handle drag-and-drop */
  onFileDrop(event: DragEvent, fieldKey: string): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadFile(file, fieldKey);
    }
  }

  /** Upload file to backend and set the URL as field value */
  private uploadFile(file: File, fieldKey: string): void {
    if (!this.selectedId || !this.siteId) return;

    // Validate size client-side
    if (file.size > 5 * 1024 * 1024) {
      this.msg = 'File quá lớn. Tối đa 5MB.';
      this.msgType = 'err';
      this.cdr.detectChanges();
      setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
      return;
    }

    this.uploadingField = fieldKey;
    this.cdr.detectChanges();

    const sectionId = this.selectedId;
    this.admin.uploadFile(this.siteId, file, 'section-bg').subscribe({
      next: (result) => {
        this.updateField(sectionId, fieldKey, result.url);
        this.uploadingField = null;
        this.msg = 'Đã tải ảnh lên thành công!';
        this.msgType = 'ok';
        this.cdr.detectChanges();
        setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        this.uploadingField = null;
        this.msg = err?.error?.error || 'Lỗi khi tải ảnh lên!';
        this.msgType = 'err';
        this.cdr.detectChanges();
        setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 4000);
      },
    });
  }

  // ---------------------------------------------------------------
  // Reset to Default
  // ---------------------------------------------------------------

  /** Reset currently selected section's config to template default */
  resetSelectedSection(): void {
    if (!this.selectedId) return;
    const template = this.getSelectedTemplate();
    const label = template?.label || this.selectedId;
    const sectionId = this.selectedId;

    this.showConfirm({
      icon: '🔄',
      title: `Đặt lại "${label}"`,
      message: `Cấu hình của section "${label}" sẽ được khôi phục về giá trị mặc định.`,
      detail: 'Các thay đổi chưa lưu cho section này sẽ bị mất.',
      confirmLabel: 'Đặt lại',
      type: 'warning',
      onConfirm: () => {
        this.builder.resetSectionToDefault(sectionId);
        this.msg = `Đã đặt lại "${label}" về mặc định.`;
        this.msgType = 'ok';
        this.cdr.detectChanges();
        setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
      },
    });
  }

  /** Reset the entire page builder to default template set */
  resetAll(): void {
    this.showConfirm({
      icon: '⚠️',
      title: 'Đặt lại toàn bộ trang',
      message: 'Tất cả sections sẽ được khôi phục về cấu hình mặc định ban đầu.',
      detail: 'Layout, nội dung đã chỉnh sửa và thứ tự sections sẽ bị xóa. Hành động này không thể hoàn tác.',
      confirmLabel: 'Đặt lại tất cả',
      type: 'danger',
      onConfirm: () => {
        this.resetting = true;
        this.builder.resetAllToDefault();
        this.msg = 'Đã đặt lại toàn bộ về mặc định.';
        this.msgType = 'ok';
        this.resetting = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.msg = ''; this.cdr.detectChanges(); }, 3000);
      },
    });
  }

  // ---------------------------------------------------------------
  // V6: Auto-draft
  // ---------------------------------------------------------------

  private startDraftTimer(): void {
    // Auto-save draft every 30 seconds
    this.draftInterval = setInterval(() => {
      if (this.siteId && this.layout.length > 0) {
        this.builder.saveDraft(this.siteId);
        this.draftTimestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        this.cdr.detectChanges();
      }
    }, 30000);
  }
}
