import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenSidebar } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() data!: EcoHavenSidebar;
  activeItem = 0;

  setActive(i: number): void { this.activeItem = i; }
}
