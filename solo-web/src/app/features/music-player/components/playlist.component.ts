import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, IconComponent } from '@app/shared';
import { StorageService, Track } from '@app/core';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="playlist-container">
      <div class="playlist-header">
        <h3>Playlist</h3>
        <app-button
          icon="add"
          variant="primary"
          size="sm"
          ariaLabel="Add track"
          (onClick)="onAddTrack()"
        ></app-button>
      </div>

      <div class="file-input-wrapper">
        <input
          #fileInput
          type="file"
          multiple
          accept="audio/*"
          (change)="onFileSelected($event)"
          style="display: none"
          aria-label="Select audio files"
        />
      </div>

      <div class="playlist">
        <div
          *ngIf="tracks.length === 0"
          class="empty-playlist"
        >
          <app-icon name="music" size="lg"></app-icon>
          <p>No tracks yet. Add your first track to get started!</p>
        </div>

        <div
          *ngFor="let track of tracks; let i = index"
          [class.track-item]="true"
          [class.active]="i === currentTrackIndex"
          (click)="onSelectTrack(i)"
        >
          <div class="track-number">{{ i + 1 }}</div>
          <div class="track-details">
            <div class="track-name">{{ track.title }}</div>
            <div class="track-meta">{{ track.artist }} • {{ formatDuration(track.duration) }}</div>
          </div>
          <div (click)="$event.stopPropagation()">
            <app-button
              icon="remove"
              variant="ghost"
              size="sm"
              ariaLabel="Remove track"
              (onClick)="onRemoveTrack(i)"
            ></app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playlist-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .playlist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .playlist-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .file-input-wrapper {
      display: none;
    }

    .playlist {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .empty-playlist {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      gap: 1rem;
    }

    .empty-playlist p {
      margin: 0;
      font-size: 0.875rem;
    }

    .track-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: rgba(255, 255, 255, 0.8);
    }

    .track-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .track-item.active {
      background: linear-gradient(90deg, var(--color-blue), var(--color-pink));
      color: white;
    }

    .track-number {
      width: 2rem;
      text-align: center;
      flex-shrink: 0;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .track-details {
      flex: 1;
      min-width: 0;
    }

    .track-name {
      font-size: 0.875rem;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-meta {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-item.active .track-meta {
      color: rgba(255, 255, 255, 0.9);
    }

    @media (max-width: 768px) {
      .playlist-container {
        max-height: 300px;
      }

      .track-item {
        padding: 0.5rem;
        gap: 0.5rem;
      }

      .track-number {
        width: 1.5rem;
      }
    }
  `]
})
export class PlaylistComponent implements OnInit {
  @Input() tracks: Track[] = [];
  @Input() currentTrackIndex: number = -1;
  @Output() selectTrack = new EventEmitter<number>();
  @Output() removeTrack = new EventEmitter<number>();
  @Output() addTracks = new EventEmitter<File[]>();

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {}

  onAddTrack(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) return;

    const audioFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        audioFiles.push(file);
      }
    }

    if (audioFiles.length > 0) {
      this.addTracks.emit(audioFiles);
    }

    // Reset file input
    input.value = '';
  }

  onSelectTrack(index: number): void {
    this.selectTrack.emit(index);
  }

  onRemoveTrack(index: number): void {
    this.removeTrack.emit(index);
  }

  formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
