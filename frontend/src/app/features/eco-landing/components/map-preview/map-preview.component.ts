import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoSectionBase, EcoProject } from '../../models/eco-site-config.interface';

@Component({
  selector: 'eco-map-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-preview.component.html',
  styleUrl: './map-preview.component.scss',
})
export class MapPreviewComponent {
  @Input() section!: EcoSectionBase;
  @Input() project!: EcoProject;
}
