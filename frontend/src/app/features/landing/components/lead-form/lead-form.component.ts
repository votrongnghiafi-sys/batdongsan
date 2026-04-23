import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SiteService } from '../../../../core/services/site.service';
import { LeadService } from '../../../../core/services/lead.service';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.css',
})
export class LeadFormComponent implements AfterViewInit {
  private siteService = inject(SiteService);
  private leadService = inject(LeadService);

  @ViewChild('sectionRef') sectionRef!: ElementRef;
  isVisible = false;

  // Form model
  name = '';
  phone = '';
  email = '';
  message = '';
  honeypot = ''; // anti-spam

  submitting = false;
  success = false;
  successMessage = '';
  errorMessage = '';

  get contact() { return this.siteService.config?.sections?.contact; }
  get site() { return this.siteService.config?.site; }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (this.sectionRef?.nativeElement) {
      observer.observe(this.sectionRef.nativeElement);
    }
  }

  submit(): void {
    // Validation
    if (!this.name.trim()) {
      this.errorMessage = 'Vui lòng nhập họ tên.';
      return;
    }
    if (!this.phone.trim() || !/^[\d\s\-\+\(\)]{8,20}$/.test(this.phone)) {
      this.errorMessage = 'Vui lòng nhập số điện thoại hợp lệ.';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    this.leadService.submitLead({
      site_key: this.site?.site_key,
      name: this.name.trim(),
      phone: this.phone.trim(),
      email: this.email.trim() || undefined,
      message: this.message.trim() || undefined,
      website: this.honeypot || undefined, // honeypot
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.success = true;
        this.successMessage = res.message;
        // Reset form
        this.name = '';
        this.phone = '';
        this.email = '';
        this.message = '';
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.error || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      },
    });
  }
}
