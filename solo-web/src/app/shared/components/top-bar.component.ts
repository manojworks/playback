import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <header class="flex items-center justify-between flex-nowrap w-full px-4 h-14 bg-white/80 backdrop-blur-md shadow-sm">
      <div class="flex items-center gap-2 flex-shrink-0">
        <div class="flex items-center justify-center w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-violet-500 text-white">
          <mat-icon>cloud</mat-icon>
        </div>
        <span class="font-semibold text-lg">Drive</span>
      </div>

      <div class="flex-1"></div>

      <div class="flex items-center gap-2">
        <button mat-icon-button aria-label="Help" (click)="$event.stopPropagation()">
          <mat-icon>help_outline</mat-icon>
        </button>
        <button mat-icon-button aria-label="Settings" (click)="$event.stopPropagation()">
          <mat-icon>settings</mat-icon>
        </button>
        <button mat-icon-button aria-label="AI" (click)="$event.stopPropagation()">
          <mat-icon>smart_toy</mat-icon>
        </button>
        <button mat-icon-button aria-label="Apps" (click)="$event.stopPropagation()">
          <mat-icon>apps</mat-icon>
        </button>
        <button mat-icon-button aria-label="Account" (click)="$event.stopPropagation()">
          <mat-icon>account_circle</mat-icon>
        </button>
      </div>
    </header>
  `
})
export class TopBarComponent {}
