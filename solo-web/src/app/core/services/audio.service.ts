import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioElement: HTMLAudioElement;
  private errorSubject$ = new Subject<string>();

  // Audio state signals
  private audioState = signal<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  });

  constructor() {
    this.audioElement = new Audio();
    this.setupAudioListeners();
  }

  private setupAudioListeners(): void {
    this.audioElement.addEventListener('timeupdate', () => {
      this.audioState.update(state => ({
        ...state,
        currentTime: this.audioElement.currentTime,
        duration: this.audioElement.duration
      }));
    });

    this.audioElement.addEventListener('ended', () => {
      this.audioState.update(state => ({
        ...state,
        isPlaying: false,
        currentTime: 0
      }));
    });

    this.audioElement.addEventListener('error', () => {
      this.errorSubject$.next('Failed to load or play audio');
    });

    this.audioElement.addEventListener('durationchange', () => {
      this.audioState.update(state => ({
        ...state,
        duration: this.audioElement.duration
      }));
    });
  }

  /**
   * Load an audio file from URL
   */
  loadTrack(url: string): void {
    try {
      this.audioElement.src = url;
      this.audioElement.load();
    } catch (error) {
      this.errorSubject$.next('Invalid audio URL');
    }
  }

  /**
   * Play the current audio
   */
  play(): void {
    this.audioElement.play().catch((error: Error) => {
      this.errorSubject$.next(`Playback error: ${error.message}`);
    });
    this.audioState.update(state => ({ ...state, isPlaying: true }));
  }

  /**
   * Pause the current audio
   */
  pause(): void {
    this.audioElement.pause();
    this.audioState.update(state => ({ ...state, isPlaying: false }));
  }

  /**
   * Stop and reset the current audio
   */
  stop(): void {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.audioState.update(state => ({
      ...state,
      isPlaying: false,
      currentTime: 0
    }));
  }

  /**
   * Seek to a specific time in the audio
   */
  seek(time: number): void {
    this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration));
  }

  /**
   * Set the volume (0-1)
   */
  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(volume, 1));
    this.audioElement.volume = normalizedVolume;
    this.audioState.update(state => ({
      ...state,
      volume: normalizedVolume
    }));
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.audioElement.muted = !this.audioElement.muted;
    this.audioState.update(state => ({
      ...state,
      isMuted: !state.isMuted
    }));
  }

  /**
   * Get the audio state signal (read-only)
   */
  getState() {
    return this.audioState.asReadonly();
  }

  /**
   * Get current state snapshot
   */
  getCurrentState(): AudioState {
    return this.audioState();
  }

  /**
   * Get error observable (for event-based error handling)
   */
  getErrors(): Observable<string> {
    return this.errorSubject$.asObservable();
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.audioState().isPlaying;
  }

  /**
   * Get the audio element (for advanced use cases)
   */
  getAudioElement(): HTMLAudioElement {
    return this.audioElement;
  }
}
