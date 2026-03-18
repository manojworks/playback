import { Injectable, signal, computed } from '@angular/core';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  coverUrl?: string;
}

export interface PlaylistState {
  tracks: Track[];
  currentTrackIndex: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private playlistState = signal<PlaylistState>({
    tracks: [],
    currentTrackIndex: -1,
    isShuffled: false,
    repeatMode: 'none'
  });

  private shuffleIndices: number[] = [];

  // Computed signals for convenient access
  readonly currentTrackIndex = computed(() => this.playlistState().currentTrackIndex);
  readonly tracks = computed(() => this.playlistState().tracks);
  readonly isShuffled = computed(() => this.playlistState().isShuffled);
  readonly repeatMode = computed(() => this.playlistState().repeatMode);

  constructor() {}

  /**
   * Get the playlist state signal (read-only)
   */
  getPlaylist() {
    return this.playlistState.asReadonly();
  }

  /**
   * Get current playlist state snapshot
   */
  getCurrentPlaylist(): PlaylistState {
    return this.playlistState();
  }

  /**
   * Get the current track
   */
  getCurrentTrack(): Track | null {
    const state = this.playlistState();
    if (state.currentTrackIndex >= 0 && state.currentTrackIndex < state.tracks.length) {
      return state.tracks[state.currentTrackIndex];
    }
    return null;
  }

  /**
   * Add a track to the playlist
   */
  addTrack(track: Track): void {
    this.playlistState.update(state => ({
      ...state,
      tracks: [...state.tracks, track]
    }));
  }

  /**
   * Add multiple tracks to the playlist
   */
  addTracks(tracks: Track[]): void {
    this.playlistState.update(state => ({
      ...state,
      tracks: [...state.tracks, ...tracks]
    }));
  }

  /**
   * Remove a track by index
   */
  removeTrack(index: number): void {
    this.playlistState.update(state => {
      const updatedTracks = state.tracks.filter((_, i) => i !== index);
      let newIndex = state.currentTrackIndex;

      // Adjust current track index if necessary
      if (index < newIndex) {
        newIndex--;
      } else if (index === newIndex) {
        newIndex = newIndex >= updatedTracks.length ? updatedTracks.length - 1 : newIndex;
      }

      return {
        ...state,
        tracks: updatedTracks,
        currentTrackIndex: updatedTracks.length > 0 ? newIndex : -1
      };
    });
  }

  /**
   * Clear the entire playlist
   */
  clearPlaylist(): void {
    this.playlistState.set({
      tracks: [],
      currentTrackIndex: -1,
      isShuffled: false,
      repeatMode: 'none'
    });
    this.shuffleIndices = [];
  }

  /**
   * Reorder tracks in the playlist (drag and drop)
   */
  reorderTracks(fromIndex: number, toIndex: number): void {
    this.playlistState.update(state => {
      const tracks = [...state.tracks];
      const [movedTrack] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, movedTrack);

      let newIndex = state.currentTrackIndex;
      if (fromIndex === newIndex) {
        newIndex = toIndex;
      } else if (fromIndex < newIndex && toIndex >= newIndex) {
        newIndex--;
      } else if (fromIndex > newIndex && toIndex <= newIndex) {
        newIndex++;
      }

      return {
        ...state,
        tracks,
        currentTrackIndex: newIndex
      };
    });
  }

  /**
   * Play track at specific index
   */
  playTrackAt(index: number): void {
    const state = this.playlistState();
    if (index >= 0 && index < state.tracks.length) {
      this.playlistState.update(s => ({
        ...s,
        currentTrackIndex: index
      }));
    }
  }

  /**
   * Play next track
   */
  playNext(): boolean {
    const state = this.playlistState();
    if (state.tracks.length === 0) return false;

    let nextIndex: number;

    if (state.isShuffled) {
      nextIndex = this.getNextShuffleIndex();
    } else {
      nextIndex = state.currentTrackIndex + 1;
    }

    if (nextIndex >= state.tracks.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return false;
      }
    }

    this.playlistState.update(s => ({
      ...s,
      currentTrackIndex: nextIndex
    }));
    return true;
  }

  /**
   * Play previous track
   */
  playPrevious(): boolean {
    const state = this.playlistState();
    if (state.tracks.length === 0) return false;

    let prevIndex: number;

    if (state.isShuffled) {
      prevIndex = this.getPreviousShuffleIndex();
    } else {
      prevIndex = state.currentTrackIndex - 1;
    }

    if (prevIndex < 0) {
      if (state.repeatMode === 'all') {
        prevIndex = state.tracks.length - 1;
      } else {
        return false;
      }
    }

    this.playlistState.update(s => ({
      ...s,
      currentTrackIndex: prevIndex
    }));
    return true;
  }

  /**
   * Toggle shuffle mode
   */
  toggleShuffle(): void {
    this.playlistState.update(state => ({
      ...state,
      isShuffled: !state.isShuffled
    }));
    this.initializeShuffleIndices();
  }

  /**
   * Set repeat mode
   */
  setRepeatMode(mode: 'none' | 'one' | 'all'): void {
    this.playlistState.update(state => ({
      ...state,
      repeatMode: mode
    }));
  }

  /**
   * Cycle through repeat modes
   */
  cycleRepeatMode(): void {
    const state = this.playlistState();
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    this.setRepeatMode(nextMode);
  }

  /**
   * Set the entire playlist
   */
  setPlaylist(tracks: Track[]): void {
    this.playlistState.set({
      tracks,
      currentTrackIndex: tracks.length > 0 ? 0 : -1,
      isShuffled: false,
      repeatMode: 'none'
    });
    this.initializeShuffleIndices();
  }

  private initializeShuffleIndices(): void {
    const state = this.playlistState();
    this.shuffleIndices = Array.from({ length: state.tracks.length }, (_, i) => i);
    this.shuffleIndices = this.shuffleArray(this.shuffleIndices);
  }

  private shuffleArray(array: number[]): number[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getNextShuffleIndex(): number {
    const state = this.playlistState();
    if (this.shuffleIndices.length === 0) {
      this.initializeShuffleIndices();
    }
    const currentIndex = this.shuffleIndices.indexOf(state.currentTrackIndex);
    const nextShuffleIndex = (currentIndex + 1) % this.shuffleIndices.length;
    return this.shuffleIndices[nextShuffleIndex];
  }

  private getPreviousShuffleIndex(): number {
    const state = this.playlistState();
    if (this.shuffleIndices.length === 0) {
      this.initializeShuffleIndices();
    }
    const currentIndex = this.shuffleIndices.indexOf(state.currentTrackIndex);
    const prevShuffleIndex = (currentIndex - 1 + this.shuffleIndices.length) % this.shuffleIndices.length;
    return this.shuffleIndices[prevShuffleIndex];
  }
}
