import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenRightPanel } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-dashboard-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-panel.component.html',
  styleUrl: './dashboard-panel.component.scss',
})
export class DashboardPanelComponent implements OnChanges {
  @Input() data!: EcoHavenRightPanel;

  // SVG ring for sustainability score
  readonly r = 50;
  readonly cx = 60;
  readonly cy = 60;
  circumference = 2 * Math.PI * this.r; // ~314.16

  scoreDash = 0;
  scoreGap  = 0;

  // Market trend SVG polyline points
  trendPoints = '';

  ngOnChanges(): void {
    if (!this.data) return;
    // Score arc
    const pct = parseFloat(this.data.score.value) / parseFloat(this.data.score.max);
    this.scoreDash = this.circumference * pct;
    this.scoreGap  = this.circumference - this.scoreDash;
    // Trend polyline
    this.buildTrendPath();
  }

  private buildTrendPath(): void {
    const pts = this.data.trend.points;
    const w = 220, h = 64;
    const max = Math.max(...pts), min = Math.min(...pts);
    const range = max - min || 1;
    const coords = pts.map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8);
      return `${x},${y}`;
    });
    this.trendPoints = coords.join(' ');
  }
}
