import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenProperty } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-property-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.scss',
})
export class PropertyListComponent {
  @Input() title = 'Featured Eco Properties';
  @Input() viewAllLabel = 'View All';
  @Input() properties: EcoHavenProperty[] = [];
}
