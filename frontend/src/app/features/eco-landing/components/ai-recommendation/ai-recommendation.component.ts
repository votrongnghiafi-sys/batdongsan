import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoSectionBase } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-ai-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-recommendation.component.html',
  styleUrl: './ai-recommendation.component.scss',
})
export class AiRecommendationComponent {
  @Input() section!: EcoSectionBase;

  budgets = ['Dưới 2 tỷ', '2–5 tỷ', '5–10 tỷ', 'Trên 10 tỷ'];
  goals   = ['Mua ở thực', 'Đầu tư', 'Cho thuê', 'Nghỉ dưỡng'];

  selectedBudget = '';
  selectedGoal   = '';
  loading        = false;
  result: { icon: string; text: string }[] | null = null;

  suggest(): void {
    if (!this.selectedBudget || !this.selectedGoal) return;
    this.loading = true;
    this.result  = null;
    setTimeout(() => {
      this.loading = false;
      this.result  = [
        { icon: '🏢', text: 'EcoTower Alpha – Phù hợp ngân sách & mục tiêu ' + this.selectedGoal },
        { icon: '🌿', text: 'Green Horizon Villa – Eco Score 98, lý tưởng dài hạn' },
        { icon: '☀️', text: 'SkyGreen Residence – Tiết kiệm năng lượng vượt trội' },
      ];
    }, 2000);
  }
}
