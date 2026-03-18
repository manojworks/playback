import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <nav class="flex flex-col gap-1 p-3 w-64 flex-shrink-0 bg-white/80 backdrop-blur-md border-r border-gray-200 overflow-y-auto">
      <button mat-button class="justify-start gap-3 rounded-lg" (click)="$event.stopPropagation()">
        <mat-icon>home</mat-icon>
        <span>Home</span>
      </button>
      <button mat-button class="justify-start gap-3 rounded-lg" (click)="$event.stopPropagation()">
        <mat-icon>library_music</mat-icon>
        <span>My Playlists</span>
      </button>
      <button mat-button class="justify-start gap-3 rounded-lg" (click)="$event.stopPropagation()">
        <mat-icon>trending_up</mat-icon>
        <span>Trending</span>
      </button>
      <button mat-button class="justify-start gap-3 rounded-lg" (click)="$event.stopPropagation()">
        <mat-icon>history</mat-icon>
        <span>Recent</span>
      </button>
      <button mat-button class="justify-start gap-3 rounded-lg" (click)="$event.stopPropagation()">
        <mat-icon>favorite</mat-icon>
        <span>Favourites</span>
      </button>
    </nav>
  `
})
export class SideNavComponent {}
