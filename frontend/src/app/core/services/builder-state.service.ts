import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SECTION_TEMPLATE_MAP, SectionTemplate } from '../constants/section-templates';

// ---------------------------------------------------------------
// V5: Page Builder Data Structures
// ---------------------------------------------------------------

/** A section instance in the layout array */
export interface LayoutItem {
  id: string;   // e.g. "hero-1", "gallery-2"
  type: string;  // e.g. "hero", "gallery"
}

/** Full builder state snapshot */
export interface BuilderState {
  layout: LayoutItem[];
  sections: Record<string, Record<string, unknown>>;
  selectedId: string | null;
  previewMode: boolean;
}

// ---------------------------------------------------------------
// BuilderStateService — central state for the page builder
// ---------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class BuilderStateService {

  // --- State Subjects ---
  private _layout = new BehaviorSubject<LayoutItem[]>([]);
  private _sections = new BehaviorSubject<Record<string, Record<string, unknown>>>({});
  private _selectedId = new BehaviorSubject<string | null>(null);
  private _previewMode = new BehaviorSubject<boolean>(false);

  // --- Public Observables ---
  readonly layout$ = this._layout.asObservable();
  readonly sections$ = this._sections.asObservable();
  readonly selectedId$ = this._selectedId.asObservable();
  readonly previewMode$ = this._previewMode.asObservable();

  // --- Getters ---
  get layout(): LayoutItem[] { return this._layout.value; }
  get sections(): Record<string, Record<string, unknown>> { return this._sections.value; }
  get selectedId(): string | null { return this._selectedId.value; }

  // ---------------------------------------------------------------
  // Init from existing config (V3/V4 backward compatible)
  // ---------------------------------------------------------------

  /**
   * Initialize builder state from site configs.
   * Handles both V4 (string[]) and V5 (LayoutItem[]) formats.
   */
  initFromConfig(
    homepage: (string | LayoutItem)[],
    sectionsConfig: Record<string, Record<string, unknown>>
  ): void {
    // Normalize to LayoutItem[] (backward compat)
    const layout = this.normalizeLayout(homepage);
    this._layout.next(layout);
    this._sections.next({ ...sectionsConfig });
    this._selectedId.next(null);
  }

  /**
   * Convert V4 string[] to V5 LayoutItem[].
   * Already-normalized items pass through.
   */
  normalizeLayout(items: (string | LayoutItem)[]): LayoutItem[] {
    if (!items?.length) return [];

    return items.map(item => {
      if (typeof item === 'string') {
        return { id: `${item}-1`, type: item };
      }
      return item as LayoutItem;
    });
  }

  // ---------------------------------------------------------------
  // Layout Operations
  // ---------------------------------------------------------------

  /** Reorder after drag & drop */
  reorder(previousIndex: number, currentIndex: number): void {
    const layout = [...this.layout];
    const [moved] = layout.splice(previousIndex, 1);
    layout.splice(currentIndex, 0, moved);
    this._layout.next(layout);
  }

  /** Add a new section instance */
  addSection(type: string): string | null {
    const template = SECTION_TEMPLATE_MAP.get(type);
    if (!template) return null;

    // Check max instances
    if (template.maxInstances > 0) {
      const count = this.layout.filter(i => i.type === type).length;
      if (count >= template.maxInstances) return null;
    }

    // Generate unique ID
    const id = this.generateId(type);

    // Add to layout
    const layout = [...this.layout, { id, type }];
    this._layout.next(layout);

    // Create default config
    const sections = { ...this.sections };
    sections[id] = { ...template.defaultConfig };
    this._sections.next(sections);

    return id;
  }

  /** Duplicate a section */
  duplicateSection(id: string): string | null {
    const item = this.layout.find(i => i.id === id);
    if (!item) return null;

    const template = SECTION_TEMPLATE_MAP.get(item.type);
    if (template && template.maxInstances > 0) {
      const count = this.layout.filter(i => i.type === item.type).length;
      if (count >= template.maxInstances) return null;
    }

    const newId = this.generateId(item.type);

    // Insert after original
    const layout = [...this.layout];
    const index = layout.findIndex(i => i.id === id);
    layout.splice(index + 1, 0, { id: newId, type: item.type });
    this._layout.next(layout);

    // Clone config
    const sections = { ...this.sections };
    sections[newId] = { ...(sections[id] || {}) };
    this._sections.next(sections);

    return newId;
  }

  /** Remove a section */
  removeSection(id: string): void {
    const layout = this.layout.filter(i => i.id !== id);
    this._layout.next(layout);

    const sections = { ...this.sections };
    delete sections[id];
    this._sections.next(sections);

    if (this.selectedId === id) {
      this._selectedId.next(null);
    }
  }

  /** Toggle section enabled */
  toggleSection(id: string): void {
    const sections = { ...this.sections };
    if (!sections[id]) sections[id] = {};
    sections[id] = { ...sections[id], enabled: !this.isSectionEnabled(id) };
    this._sections.next(sections);
  }

  /** Check if section is enabled */
  isSectionEnabled(id: string): boolean {
    return this.sections[id]?.['enabled'] !== false;
  }

  // ---------------------------------------------------------------
  // Section Config Operations
  // ---------------------------------------------------------------

  /** Update a single field in a section config */
  updateField(id: string, field: string, value: unknown): void {
    const sections = { ...this.sections };
    if (!sections[id]) sections[id] = {};
    sections[id] = { ...sections[id], [field]: value };
    this._sections.next(sections);
  }

  /** Get config for a section */
  getSectionConfig(id: string): Record<string, unknown> {
    return this.sections[id] || {};
  }

  /** Get template for a section by its ID */
  getTemplate(id: string): SectionTemplate | undefined {
    const item = this.layout.find(i => i.id === id);
    if (!item) return undefined;
    return SECTION_TEMPLATE_MAP.get(item.type);
  }

  // ---------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------

  select(id: string | null): void {
    this._selectedId.next(id);
  }

  // ---------------------------------------------------------------
  // Preview Mode
  // ---------------------------------------------------------------

  setPreviewMode(mode: boolean): void {
    this._previewMode.next(mode);
  }

  // ---------------------------------------------------------------
  // Export for saving (backward compatible)
  // ---------------------------------------------------------------

  /** Export layout as V4-compatible string[] for backward compat */
  exportLayoutV4(): string[] {
    return this.layout.map(item => item.type);
  }

  /** Export layout as V5 LayoutItem[] */
  exportLayoutV5(): LayoutItem[] {
    return [...this.layout];
  }

  /** Export sections config (keyed by instance ID) */
  exportSections(): Record<string, Record<string, unknown>> {
    return { ...this.sections };
  }

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------

  private generateId(type: string): string {
    const existing = this.layout.filter(i => i.type === type);
    let counter = existing.length + 1;

    // Ensure unique
    while (this.layout.some(i => i.id === `${type}-${counter}`)) {
      counter++;
    }

    return `${type}-${counter}`;
  }
}
