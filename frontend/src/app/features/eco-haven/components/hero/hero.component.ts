import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoHavenHero } from '../../models/eco-haven.interface';

@Component({
  selector: 'eh-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  @Input() hero!: EcoHavenHero;
}
