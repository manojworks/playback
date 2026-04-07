import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, IconComponent } from '@app/shared';
import { StorageService, Track } from '@app/core';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
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
