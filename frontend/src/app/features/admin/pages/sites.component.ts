import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AiThemeService, AiPalette } from '../../../core/services/ai-theme.service';
import { THEME_PRESETS, ThemePreset } from '../../../core/constants/theme-presets';
import { SiteConfigMap } from '../../../core/models/interfaces';

type TabKey = 'general' | 'branding' | 'theme' | 'contact' | 'project' | 'lead' | 'features' | 'layout' | 'sections' | 'seo';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sites',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sites.component.html',
  styleUrl: './sites.component.css',
})
export class AdminSitesComponent implements OnInit, OnDestroy {
  private admin = inject(AdminService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private aiTheme = inject(AiThemeService);
  private router = inject(Router);

  // State
  sites: any[] = [];
  editId = 0;
  msg = '';
  msgType = '';
  activeTab: TabKey = 'general';
  saving = false;
  configLoaded = false;

  // Theme Presets
  readonly presets = THEME_PRESETS;
  selectedPreset: ThemePreset | null = null;

  // AI Palette Generator state
  aiMode: 'hex' | 'logo' = 'hex';
  aiHexInput = '#0A84FF';
  aiLoading = false;
  aiPalette: AiPalette | null = null;
  aiError = '';
  aiFileName = '';

  // Preview
  previewColors = { primary: '#0A84FF', secondary: '#30D158', bg: '#08080f', text: '#f0f0f5' };

  readonly tabs: Tab[] = [
    { key: 'general',  label: 'Tổng quan',  icon: '⚙️' },
    { key: 'branding', label: 'Thương hiệu', icon: '🏷️' },
    { key: 'theme',    label: 'Giao diện',   icon: '🎨' },
    { key: 'contact',  label: 'Liên hệ',     icon: '📞' },
    { key: 'project',  label: 'Dự án',       icon: '🏗️' },
    { key: 'lead',     label: 'Lead',        icon: '📝' },
    { key: 'features', label: 'Tính năng',   icon: '🔧' },
    { key: 'layout',   label: 'Bố cục',      icon: '📐' },
    { key: 'sections', label: 'Nội dung',     icon: '🧩' },
    { key: 'seo',      label: 'SEO',         icon: '🔍' },
  ];

  // Forms
  generalForm!: FormGroup;
  brandingForm!: FormGroup;
  themeForm!: FormGroup;
  contactForm!: FormGroup;
  projectForm!: FormGroup;
  leadForm!: FormGroup;
  featuresForm!: FormGroup;
  layoutForm!: FormGroup;
  seoForm!: FormGroup;

  // V4: Section-level config
  sectionsData: Record<string, any> = {};
  expandedSection: string | null = null;

  // Available sections for layout builder
  readonly availableSections = [
    { key: 'hero', label: 'Hero Banner' },
    { key: 'about', label: 'Giới thiệu' },
    { key: 'property-list', label: 'Danh sách BĐS' },
    { key: 'amenities', label: 'Tiện ích' },
    { key: 'gallery', label: 'Thư viện ảnh' },
    { key: 'location', label: 'Vị trí' },
    { key: 'lead-form', label: 'Form liên hệ' },
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadSites();
  }

  ngOnDestroy(): void {}

  // ---------------------------------------------------------------
  // Form Initialization
  // ---------------------------------------------------------------
  private initForms(): void {
    this.generalForm = this.fb.group({
      site_key: ['', [Validators.required, Validators.pattern(/^[a-z0-9\-]+$/)]],
      name: ['', Validators.required],
      domain: [''],
      is_active: [true],
    });

    this.brandingForm = this.fb.group({
      logoUrl: [''],
      faviconUrl: [''],
      siteName: [''],
    });

    this.themeForm = this.fb.group({
      primaryColor: ['#0A84FF'],
      secondaryColor: ['#30D158'],
      backgroundColor: ['#08080f'],
      textColor: ['#f0f0f5'],
      fontFamily: ['Inter'],
      // V3 semantic tokens
      accentColor: ['#38BDF8'],
      borderColor: ['rgba(255, 255, 255, 0.08)'],
      mutedColor: ['#6B7280'],
      borderRadius: ['12px'],
    });

    this.contactForm = this.fb.group({
      phone: [''],
      email: ['', Validators.email],
      address: [''],
      workingHours: [''],
    });

    this.projectForm = this.fb.group({
      defaultView: ['grid'],
      itemsPerPage: [6, [Validators.min(1), Validators.max(50)]],
      showPrice: [true],
      showArea: [true],
      showStatus: [true],
      priceUnit: ['VND'],
    });

    this.leadForm = this.fb.group({
      formTitle: ['Liên hệ tư vấn'],
      formSubtitle: ['Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút'],
      enableHoneypot: [true],
      rateLimit: [5, [Validators.min(1), Validators.max(100)]],
      notifyEmail: ['', Validators.email],
      // V3
      webhookUrl: [''],
      successMessage: ['Cảm ơn bạn, chuyên viên sẽ liên hệ sớm.'],
    });

    this.featuresForm = this.fb.group({
      chatbot: [false],
      aiAnalysis: [false],
      booking: [false],
      gallery: [true],
      propertyFilter: [true],
      leadForm: [true],
      map: [true],
    });

    this.layoutForm = this.fb.group({
      homepage: this.fb.array([]),
    });

    this.seoForm = this.fb.group({
      metaTitle: ['', Validators.maxLength(70)],
      metaDescription: ['', Validators.maxLength(160)],
      ogImage: [''],
      keywords: [''],
      // V3
      canonicalUrl: [''],
      robots: ['index,follow'],
    });

    // Live preview for theme tab
    this.themeForm.valueChanges.subscribe(val => {
      this.previewColors = {
        primary: val.primaryColor || '#0A84FF',
        secondary: val.secondaryColor || '#30D158',
        bg: val.backgroundColor || '#08080f',
        text: val.textColor || '#f0f0f5',
      };
    });
  }

  get homepageSections(): FormArray {
    return this.layoutForm.get('homepage') as FormArray;
  }

  // ---------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------
  loadSites(): void {
    this.admin.getSites().subscribe(s => {
      this.sites = s;
      this.cdr.detectChanges();
    });
  }

  loadConfigs(siteId: number): void {
    this.admin.getSiteConfigs(siteId).subscribe({
      next: (configs: SiteConfigMap) => {
        this.patchConfigs(configs);
        this.configLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        // Config table might not exist yet — use defaults
        this.configLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  private patchConfigs(configs: SiteConfigMap): void {
    if (configs.branding) this.brandingForm.patchValue(configs.branding);
    if (configs.theme) {
      this.themeForm.patchValue(configs.theme);
    }
    if (configs.contact) this.contactForm.patchValue(configs.contact);
    if (configs.project) this.projectForm.patchValue(configs.project);
    if (configs.lead) this.leadForm.patchValue(configs.lead);
    if (configs.features) this.featuresForm.patchValue(configs.features);
    if (configs.seo) this.seoForm.patchValue(configs.seo);

    // Layout — rebuild FormArray
    const homepage = configs.layout?.homepage || [];
    this.homepageSections.clear();
    homepage.forEach(s => this.homepageSections.push(new FormControl(s)));

    // V4: Sections config
    if ((configs as any).sections) {
      this.sectionsData = { ...(configs as any).sections };
    }
  }

  // ---------------------------------------------------------------
  // Layout Builder
  // ---------------------------------------------------------------
  addSection(sectionKey: string): void {
    if (!this.homepageSections.value.includes(sectionKey)) {
      this.homepageSections.push(new FormControl(sectionKey));
    }
  }

  removeSection(index: number): void {
    this.homepageSections.removeAt(index);
  }

  moveSection(index: number, direction: 'up' | 'down'): void {
    const arr = this.homepageSections;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;

    const current = arr.at(index).value;
    const swap = arr.at(target).value;
    arr.at(index).setValue(swap);
    arr.at(target).setValue(current);
  }

  getSectionLabel(key: string): string {
    return this.availableSections.find(s => s.key === key)?.label || key;
  }

  getUnusedSections(): { key: string; label: string }[] {
    const used = new Set(this.homepageSections.value);
    return this.availableSections.filter(s => !used.has(s.key));
  }

  // ---------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------
  save(): void {
    // Validate general tab
    if (this.generalForm.invalid) {
      this.activeTab = 'general';
      this.generalForm.markAllAsTouched();
      this.msg = 'Vui lòng kiểm tra thông tin bắt buộc ở tab Tổng quan.';
      this.msgType = 'err';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    const general = this.generalForm.value;

    // Step 1: Save site (general tab)
    const sitePayload = {
      ...general,
      primary_color: this.themeForm.value.primaryColor,
      secondary_color: this.themeForm.value.secondaryColor,
      phone: this.contactForm.value.phone,
      email: this.contactForm.value.email,
      logo_url: this.brandingForm.value.logoUrl,
    };

    const siteObs = this.editId
      ? this.admin.updateSite({ ...sitePayload, id: this.editId })
      : this.admin.createSite(sitePayload);

    siteObs.subscribe({
      next: (res: any) => {
        const siteId = this.editId || res.id;

        // Step 2: Save config groups
        const configs: Partial<SiteConfigMap> = {
          branding: this.brandingForm.value,
          theme: this.themeForm.value,
          contact: this.contactForm.value,
          project: this.projectForm.value,
          lead: this.leadForm.value,
          features: this.featuresForm.value,
          layout: { homepage: this.homepageSections.value },
          seo: this.seoForm.value,
        };

        // V4: Include sections config
        (configs as any).sections = this.sectionsData;

        this.admin.updateSiteConfigs(siteId, configs).subscribe({
          next: () => {
            this.msg = this.editId ? 'Đã cập nhật thành công!' : 'Đã tạo site mới!';
            this.msgType = 'ok';
            this.saving = false;
            // Keep form open — set editId for newly created sites
            if (!this.editId) {
              this.editId = siteId;
            }
            this.loadSites();
            this.cdr.detectChanges();
          },
          error: () => {
            // Site saved but config failed — partial success
            this.msg = 'Site đã lưu, nhưng config chưa cập nhật (có thể cần chạy migration).';
            this.msgType = 'err';
            this.saving = false;
            this.loadSites();
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.msg = 'Lỗi khi lưu site!';
        this.msgType = 'err';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ---------------------------------------------------------------
  // Edit / Cancel / Delete
  // ---------------------------------------------------------------
  edit(s: any): void {
    this.editId = s.id;
    this.generalForm.patchValue({
      site_key: s.site_key,
      name: s.name,
      domain: s.domain,
      is_active: !!s.is_active,
    });

    // Pre-fill from sites table (V1 fallback)
    this.themeForm.patchValue({
      primaryColor: s.primary_color || '#0A84FF',
      secondaryColor: s.secondary_color || '#30D158',
    });
    this.contactForm.patchValue({
      phone: s.phone || '',
      email: s.email || '',
    });
    this.brandingForm.patchValue({
      logoUrl: s.logo_url || '',
      siteName: s.name || '',
    });

    // Then load full configs (will overwrite with V2 data if available)
    this.loadConfigs(s.id);

    this.activeTab = 'general';
    this.msg = '';
    this.cdr.detectChanges();
  }

  cancelEdit(): void {
    this.editId = 0;
    this.configLoaded = false;
    this.activeTab = 'general';
    this.initForms();
    this.cdr.detectChanges();
  }

  remove(s: any): void {
    if (!confirm(`Xóa site "${s.site_key}" và TẤT CẢ dữ liệu?`)) return;
    this.admin.deleteSite(s.id).subscribe(() => {
      this.msg = 'Đã xóa!';
      this.msgType = 'ok';
      this.loadSites();
    });
  }

  // ---------------------------------------------------------------
  // Tab
  // ---------------------------------------------------------------
  setTab(tab: TabKey): void {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  // Helpers for template
  hasError(form: FormGroup, field: string): boolean {
    const ctrl = form.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  // ---------------------------------------------------------------
  // AI Palette Generator
  // ---------------------------------------------------------------
  setAiMode(mode: 'hex' | 'logo'): void {
    this.aiMode = mode;
    this.aiPalette = null;
    this.aiError = '';
    this.aiFileName = '';
    this.cdr.detectChanges();
  }

  generateFromHex(): void {
    const hex = this.aiHexInput?.trim();
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
      this.aiError = 'Vui lòng nhập mã màu HEX hợp lệ (vd: #ff0000)';
      this.cdr.detectChanges();
      return;
    }
    this.aiLoading = true;
    this.aiError = '';
    this.aiPalette = null;
    this.cdr.detectChanges();

    this.aiTheme.generateFromHex(hex).subscribe({
      next: (palette) => {
        this.aiPalette = palette;
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.aiError = 'Không thể tạo bảng màu.';
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.aiError = 'Vui lòng chọn file hình ảnh.';
      this.cdr.detectChanges();
      return;
    }

    this.aiFileName = file.name;
    this.aiLoading = true;
    this.aiError = '';
    this.aiPalette = null;
    this.cdr.detectChanges();

    // Try server-side first, fallback to client-side
    this.aiTheme.generateFromImage(file).subscribe({
      next: (palette) => {
        this.aiPalette = palette;
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to client-side Canvas extraction
        this.aiTheme.extractFromImageClientSide(file).subscribe({
          next: (palette) => {
            this.aiPalette = palette;
            this.aiLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.aiError = 'Không thể phân tích ảnh.';
            this.aiLoading = false;
            this.cdr.detectChanges();
          },
        });
      },
    });
  }

  applyAiPalette(): void {
    if (!this.aiPalette) return;

    this.themeForm.patchValue({
      primaryColor: this.aiPalette.primaryColor,
      secondaryColor: this.aiPalette.secondaryColor,
      backgroundColor: this.aiPalette.backgroundColor,
      textColor: this.aiPalette.textColor,
    });

    // Triggers the existing themeForm.valueChanges → previewColors update
    this.cdr.detectChanges();
  }

  regenerateAiPalette(): void {
    if (this.aiMode === 'hex') {
      this.generateFromHex();
    }
    // For logo mode, user re-selects file
  }

  // ---------------------------------------------------------------
  // Theme Presets
  // ---------------------------------------------------------------
  applyPreset(preset: ThemePreset): void {
    this.selectedPreset = preset;

    this.themeForm.patchValue({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.background,
      textColor: preset.text,
    });

    // Clear AI palette (preset takes precedence visually)
    this.aiPalette = null;
    this.cdr.detectChanges();
  }

  applyRandomPreset(): void {
    const available = this.presets.filter(p => p !== this.selectedPreset);
    const random = available[Math.floor(Math.random() * available.length)];
    this.applyPreset(random);
  }

  isPresetActive(preset: ThemePreset): boolean {
    if (!this.selectedPreset) return false;
    return this.selectedPreset.name === preset.name;
  }

  // V5: Open Page Builder
  openBuilder(): void {
    if (!this.editId) return;
    this.router.navigate(['/admin/builder'], { queryParams: { site_id: this.editId } });
  }
}
