import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// CTA is now part of DashboardPanelComponent's rightPanel.cta
// This component is kept for backward compat but unused in eco-haven layout
@Component({
  selector: 'eh-cta',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class CtaComponent {
  @Input() data: unknown = null;
}
