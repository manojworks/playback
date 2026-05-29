import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SongDetails } from '../../../core/services/song.service';

@Component({
  selector: 'app-song-details-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './song-details-popup.component.html',
  styleUrls: ['./song-details-popup.component.scss']
})
export class SongDetailsPopupComponent {
  @Input() song: SongDetails | null = null;
  @Output() close = new EventEmitter<void>();

  handleClose(): void {
    this.close.emit();
  }
}
