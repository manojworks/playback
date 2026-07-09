import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SongDetails } from '../../../core/services/song.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-song-details-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProgressBarComponent],
  templateUrl: './song-details-popup.component.html',
  styleUrls: ['./song-details-popup.component.scss']
})
export class SongDetailsPopupComponent {
  @Input() song: SongDetails | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();

  currentTime: number = 0;
  duration: number = 180; // Default 3 minutes in seconds

  get songDuration(): number {
    // Return song duration if available, otherwise use default
    return this.song?.duration || this.duration;
  }

  handleClose(): void {
    this.close.emit();
  }

  onSeek(newTime: number): void {
    this.currentTime = newTime;
    this.seek.emit(newTime);
  }
}
