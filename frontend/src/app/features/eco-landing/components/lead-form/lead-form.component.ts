import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EcoSectionBase, EcoContact, EcoProject } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-lead-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.scss',
})
export class LeadFormComponent {
  @Input() section!: EcoSectionBase;
  @Input() contact!: EcoContact;
  @Input() project!: EcoProject;

  name      = '';
  phone     = '';
  interest  = '';
  budget    = '';
  message   = '';
  honey     = ''; // honeypot

  submitting = false;
  success    = false;

  submit(): void {
    if (!this.name || !this.phone || this.honey) return;
    this.submitting = true;
    // Ready for: this.http.post('/api/lead.php', payload)
    setTimeout(() => {
      this.submitting = false;
      this.success    = true;
    }, 1400);
  }

  reset(): void {
    this.success  = false;
    this.name     = '';
    this.phone    = '';
    this.interest = '';
    this.budget   = '';
    this.message  = '';
  }
}
