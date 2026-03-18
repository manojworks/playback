import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@app/shared';
import { StorageService } from '@app/core';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="controls">
      <div class="control-group">
        <app-button
          icon="shuffle"
          [variant]="isShuffled ? 'primary' : 'ghost'"
          size="md"
          ariaLabel="Toggle shuffle"
          (onClick)="onToggleShuffle()"
        ></app-button>

        <app-button
          icon="skip-prev"
          variant="ghost"
          size="lg"
          ariaLabel="Previous track"
          (onClick)="onPrevious()"
        ></app-button>

        <app-button
          [icon]="isPlaying ? 'pause' : 'play'"
          variant="primary"
          size="lg"
          ariaLabel="Play/Pause"
          (onClick)="onTogglePlay()"
        ></app-button>

        <app-button
          icon="skip-next"
          variant="ghost"
          size="lg"
          ariaLabel="Next track"
          (onClick)="onNext()"
        ></app-button>

        <app-button
          [icon]="repeatModeIcon"
          [variant]="repeatMode !== 'none' ? 'primary' : 'ghost'"
          size="md"
          [ariaLabel]="'Repeat: ' + repeatMode"
          (onClick)="onCycleRepeat()"
        ></app-button>
      </div>

      <div class="volume-control">
        <app-button
          [icon]="volumeIcon"
          variant="ghost"
          size="sm"
          ariaLabel="Toggle mute"
          (onClick)="onToggleMute()"
        ></app-button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          [value]="isMuted ? 0 : volume"
          (input)="onVolumeChange($event)"
          class="volume-slider"
          aria-label="Volume"
        />
      </div>
    </div>
  `,
  styles: [`
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      width: 100%;
      max-width: 600px;
    }

    .control-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 150px;
    }

    .volume-slider {
      flex: 1;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
    }

    .volume-slider::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .volume-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .volume-slider::-moz-range-track {
      background: transparent;
      border: none;
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
        gap: 1rem;
      }

      .control-group {
        gap: 0.75rem;
      }
    }
  `]
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
