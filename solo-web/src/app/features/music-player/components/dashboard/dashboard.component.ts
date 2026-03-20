import { Component, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService, PlaylistService, StorageService, Track } from '@app/core';
import { ProgressBarComponent, IconComponent, TopBarComponent, SideNavComponent, SearchPanelComponent, ListingsPanelComponent } from '@app/shared';
import { ControlsComponent } from '../controls/controls.component';
import { PlaylistComponent } from '../playlist/playlist.component';

interface DashboardState {
  currentTrackIndex: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, IconComponent, TopBarComponent, SideNavComponent, SearchPanelComponent, ListingsPanelComponent, ControlsComponent, PlaylistComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
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
    const savedPlayerState = this.storageService.getItem<DashboardState>('playerState');

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

  addTracks(files: File[]): void {
    // Convert File[] to Track[] - this is a simplified conversion
    // In a real app, you'd extract metadata from the files
    const tracks: Track[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      artist: 'Unknown Artist',
      duration: 0, // Would need to be calculated from audio file
      url: URL.createObjectURL(file),
      coverUrl: undefined
    }));

    this.playlistService.addTracks(tracks);
    this.storageService.setItem('playlist', this.playlistService.getCurrentPlaylist().tracks);
  }
}