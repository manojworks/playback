import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@app/shared';
import { StorageService } from '@app/core';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent {
  @Input() isPlaying: boolean = false;
  @Input() volume: number = 1;
  @Input() isMuted: boolean = false;
  @Input() repeatMode: 'none' | 'one' | 'all' = 'none';
  @Input() isShuffled: boolean = false;

  @Output() togglePlay = new EventEmitter<void>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() volumeChange = new EventEmitter<number>();
  @Output() nextTrack = new EventEmitter<void>();
  @Output() prevTrack = new EventEmitter<void>();
  @Output() toggleShuffle = new EventEmitter<void>();
  @Output() repeatModeChange = new EventEmitter<'none' | 'one' | 'all'>();

  get volumeIcon(): 'volume-high' | 'volume-low' | 'volume-muted' {
    if (this.isMuted || this.volume === 0) return 'volume-muted';
    if (this.volume < 0.5) return 'volume-low';
    return 'volume-high';
  }

  get repeatModeIcon(): 'repeat' | 'repeat-one' {
    return this.repeatMode === 'one' ? 'repeat-one' : 'repeat';
  }

  onTogglePlay(): void {
    this.togglePlay.emit();
  }

  onToggleMute(): void {
    this.toggleMute.emit();
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    this.volumeChange.emit(volume);
  }

  onNext(): void {
    this.nextTrack.emit();
  }

  onPrevious(): void {
    this.prevTrack.emit();
  }

  onToggleShuffle(): void {
    this.toggleShuffle.emit();
  }

  onCycleRepeat(): void {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(this.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.repeatModeChange.emit(nextMode);
  }
}
