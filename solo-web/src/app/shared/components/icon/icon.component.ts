import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName = 
  | 'play' | 'pause' | 'stop'
  | 'skip-next' | 'skip-prev'
  | 'volume-high' | 'volume-low' | 'volume-muted'
  | 'shuffle' | 'repeat' | 'repeat-one'
  | 'add' | 'remove' | 'close'
  | 'menu' | 'heart' | 'share' | 'music';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() name: IconName = 'play';
  @Input() size: IconSize = 'md';
  @Input() ariaLabel?: string;
}
