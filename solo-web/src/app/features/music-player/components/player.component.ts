import { Component, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, PlaylistService, StorageService, Track } from '@app/core';
import { ProgressBarComponent, IconComponent, TopBarComponent, SideNavComponent, SearchPanelComponent, ListingsPanelComponent } from '@app/shared';
import { ControlsComponent } from './controls.component';
import { PlaylistComponent } from './playlist.component';

interface PlayerState {
  currentTrackIndex: number;
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, IconComponent, TopBarComponent, SideNavComponent, SearchPanelComponent, ListingsPanelComponent, ControlsComponent, PlaylistComponent],
  template: `
    <div class="player-container">
      <app-top-bar></app-top-bar>

      <div class="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        <app-side-nav></app-side-nav>

        <main class="flex-1 overflow-auto">
          <app-search-panel></app-search-panel>

          <app-listings-panel></app-listings-panel>

          <!-- Music player UI (kept for later) -->
          <div *ngIf="false">
            <div class="player-main">
              <!-- Album Art / Visualization -->
              <div class="album-art">
                <img 
                  *ngIf="currentTrack()?.coverUrl"
                  [src]="currentTrack()!.coverUrl"
                  [alt]="currentTrack()!.title || 'Album art'"
                />
                <div *ngIf="!currentTrack()?.coverUrl" class="placeholder">
                  <app-icon name="play" size="xl"></app-icon>
                </div>
              </div>

              <!-- Track Info -->
              <div class="track-info">
                <h2 class="track-title">{{ currentTrack()?.title || 'No track selected' }}</h2>
                <p class="track-artist">{{ currentTrack()?.artist || 'Unknown Artist' }}</p>
              </div>

              <!-- Progress Bar -->
              <app-progress-bar
                [currentValue]="audioState().currentTime"
                [max]="audioState().duration"
                [showLabels]="true"
                (valueChange)="onSeek($event)"
                ariaLabel="Seek track"
              ></app-progress-bar>

              <!-- Controls -->
              <app-controls
                [isPlaying]="audioState().isPlaying"
                [volume]="audioState().volume"
                [isMuted]="audioState().isMuted"
                [repeatMode]="playlistState().repeatMode"
                [isShuffled]="playlistState().isShuffled"
                (togglePlay)="togglePlay()"
                (toggleMute)="toggleMute()"
                (volumeChange)="onVolumeChange($event)"
                (nextTrack)="playNext()"
                (prevTrack)="playPrevious()"
                (toggleShuffle)="toggleShuffle()"
                (repeatModeChange)="setRepeatMode($event)"
              ></app-controls>
            </div>

            <!-- Playlist -->
            <app-playlist
              [tracks]="playlistState().tracks"
              [currentTrackIndex]="playlistState().currentTrackIndex"
              (selectTrack)="selectTrack($event)"
              (removeTrack)="removeTrack($event)"
              (addTracks)="addTrack($event)"
            ></app-playlist>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .player-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      overflow: hidden;
    }

    .player-main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      gap: 2rem;
      flex: 0 0 auto;
    }

    .album-art {
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .album-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
    }

    .track-info {
      text-align: center;
      width: 100%;
    }

    .track-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      margin-bottom: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .track-artist {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    app-progress-bar {
      width: 100%;
      max-width: 400px;
    }

    app-playlist {
      flex: 1;
      overflow-y: auto;
      width: 100%;
      min-height: 0;
    }

    @media (max-width: 768px) {
      .player-main {
        padding: 1rem;
        gap: 1rem;
      }

      .album-art {
        width: 150px;
        height: 150px;
      }

      .track-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class PlayerComponent implements OnInit {
  constructor(
    private audioService: AudioService,
    private playlistService: PlaylistService,
    private storageService: StorageService
  ) {
    // Effect to handle track changes
    effect(() => {
      const track = this.currentTrack();
      if (track) {
        this.audioService.stop();
        this.audioService.loadTrack(track.url);
        if (this.audioState().isPlaying) {
          this.audioService.play();
        }
      }
    });

    // Effect to save playlist state
    effect(() => {
      const playlist = this.playlistState();
      this.storageService.setItem('playerState', { currentTrackIndex: playlist.currentTrackIndex });
    });
  }

  // Signals from services - use getters to avoid initialization order issues
  get audioState() {
    return this.audioService.getState();
  }

  get playlistState() {
    return this.playlistService.getPlaylist();
  }

  // Computed signals
  currentTrack = computed(() => this.playlistService.getCurrentTrack());

  ngOnInit(): void {
    this.loadSavedPlaylist();
  }

  private loadSavedPlaylist(): void {
    const savedPlaylist = this.storageService.getItem<Track[]>('playlist');
    const savedPlayerState = this.storageService.getItem<PlayerState>('playerState');

    if (savedPlaylist && savedPlaylist.length > 0) {
      this.playlistService.setPlaylist(savedPlaylist);
      if (savedPlayerState?.currentTrackIndex !== undefined) {
        this.playlistService.playTrackAt(savedPlayerState.currentTrackIndex);
      }
    }
  }

  togglePlay(): void {
    if (!this.currentTrack()) return;

    if (this.audioState().isPlaying) {
      this.audioService.pause();
    } else {
      this.audioService.play();
    }
  }

  toggleMute(): void {
    this.audioService.toggleMute();
  }

  onVolumeChange(volume: number): void {
    this.audioService.setVolume(volume);
  }

  onSeek(time: number): void {
    this.audioService.seek(time);
  }

  playNext(): void {
    const hasNext = this.playlistService.playNext();
    if (!hasNext && this.playlistService.getCurrentPlaylist().repeatMode === 'none') {
      this.audioService.stop();
    } else if (hasNext) {
      const track = this.playlistService.getCurrentTrack();
      if (track) {
        this.audioService.loadTrack(track.url);
        this.audioService.play();
      }
    }
  }

  playPrevious(): void {
    const hasPrev = this.playlistService.playPrevious();
    if (hasPrev) {
      const track = this.playlistService.getCurrentTrack();
      if (track) {
        this.audioService.loadTrack(track.url);
        this.audioService.play();
      }
    }
  }

  selectTrack(index: number): void {
    this.playlistService.playTrackAt(index);
    const track = this.playlistService.getCurrentTrack();
    if (track) {
      this.audioService.loadTrack(track.url);
      this.audioService.play();
    }
  }

  removeTrack(index: number): void {
    this.playlistService.removeTrack(index);
    this.storageService.setItem('playlist', this.playlistService.getCurrentPlaylist().tracks);
  }

  toggleShuffle(): void {
    this.playlistService.toggleShuffle();
  }

  setRepeatMode(mode: 'none' | 'one' | 'all'): void {
    this.playlistService.setRepeatMode(mode);
  }

  addTrack(files?: File[]): void {
    if (!files || files.length === 0) return;

    const newTracks: Track[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const track: Track = {
          id: `${Date.now()}-${i}`,
          title: file.name.replace(/\.[^.]+$/, ''),
          artist: 'Unknown Artist',
          duration: 0,
          url
        };
        newTracks.push(track);
      }
    }

    if (newTracks.length > 0) {
      this.playlistService.addTracks(newTracks);
      this.storageService.setItem('playlist', this.playlistService.getCurrentPlaylist().tracks);

      // Autoplay first added track if nothing is currently playing
      if (!this.currentTrack() && this.playlistService.getCurrentPlaylist().tracks.length > 0) {
        const firstTrackIndex = this.playlistService.getCurrentPlaylist().currentTrackIndex;
        this.selectTrack(firstTrackIndex >= 0 ? firstTrackIndex : 0);
      }
    }
  }
}
