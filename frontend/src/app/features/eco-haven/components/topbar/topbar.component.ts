import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenTopbar } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() data!: EcoHavenTopbar;
}
