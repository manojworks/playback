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
  template: `
    <svg
      [class]="'icon icon-' + size"
      [attr.aria-label]="ariaLabel"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <ng-container [ngSwitch]="name">
        <!-- Playback icons -->
        <ng-container *ngSwitchCase="'play'">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </ng-container>

        <ng-container *ngSwitchCase="'pause'">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </ng-container>

        <ng-container *ngSwitchCase="'stop'">
          <rect x="4" y="4" width="16" height="16"></rect>
        </ng-container>

        <!-- Skip icons -->
        <ng-container *ngSwitchCase="'skip-next'">
          <polygon points="5 4 15 12 5 20 5 4"></polygon>
          <line x1="19" y1="4" x2="19" y2="20"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'skip-prev'">
          <polygon points="19 4 9 12 19 20 19 4"></polygon>
          <line x1="5" y1="4" x2="5" y2="20"></line>
        </ng-container>

        <!-- Volume icons -->
        <ng-container *ngSwitchCase="'volume-high'">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a6.5 6.5 0 0 1 0 9.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'volume-low'">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a3.5 3.5 0 0 1 0 7.07"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'volume-muted'">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </ng-container>

        <!-- Playlist icons -->
        <ng-container *ngSwitchCase="'shuffle'">
          <path d="M2 18h4v-2H2v2zm16-12v6h2V6h-2zm3 0v2h2V6h-2zM9 6H7v2h2V6zm0 6H2v2h7v-2zm0-6H2v2h7V6z"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'repeat'">
          <polyline points="17 2 21 6 17 10"></polyline>
          <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 22 3 18 7 14"></polyline>
          <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'repeat-one'">
          <path d="M21 2v6h-6M3 22v-6h6M3 5a4 4 0 0 1 7 0c0 1.25-.756 2.464-2 2.816V13a2 2 0 0 1-2 2 2 2 0 0 1-2-2V7.816C3.756 7.464 2 6.25 2 5"></path>
        </ng-container>

        <!-- Utility icons -->
        <ng-container *ngSwitchCase="'add'">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'remove'">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'close'">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'menu'">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'heart'">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </ng-container>

        <ng-container *ngSwitchCase="'share'">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </ng-container>

        <ng-container *ngSwitchCase="'music'">
          <path d="M9 18v-13m0-1h8v13m-8-15a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path>
          <path d="M17 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"></path>
        </ng-container>
      </ng-container>
    </svg>
  `,
  styles: [`
    svg {
      display: inline-block;
      vertical-align: middle;
      color: currentColor;
    }

    .icon-xs { width: 1rem; height: 1rem; }
    .icon-sm { width: 1.25rem; height: 1.25rem; }
    .icon-md { width: 1.5rem; height: 1.5rem; }
    .icon-lg { width: 2rem; height: 2rem; }
    .icon-xl { width: 2.5rem; height: 2.5rem; }
  `]
})
export class IconComponent {
  @Input() name: IconName = 'play';
  @Input() size: IconSize = 'md';
  @Input() ariaLabel?: string;
}
