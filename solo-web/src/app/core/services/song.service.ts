import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface SongDetails {
  songId: string;
  title: string;
  movie: string;
  release_year?: number;
  singers: string[];
  composers: string[];
  lyricists: string[];
  actors: string[];
  categories: string[];
  lyrics: string;
  imageUrl?: string;
  audio_url?: string;
  video_url?: string;
}

interface SongDetailsResponse {
  song_id: string;
  song_title_en: string;
  song_title_dn?: string;
  singers: string[];
  music_directors: string[];
  actors: string[];
  lyricist: string[];
  album: string;
  release_year?: number;
  categories: string[];
  lyrics_text_en?: string;
  lyrics_text_dn?: string;
  audio_url?: string;
  video_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SongService {
  constructor(private http: HttpClient) {}

  getSongDetails(songId: string): Observable<SongDetails | null> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.songDetails}${songId}/`;
    return this.http.get<SongDetailsResponse>(url).pipe(
      map(response => this.mapSongDetailsResponse(response)),
      catchError(error => {
        console.error('Error loading song details:', error);
        return of(null);
      })
    );
  }

  private mapSongDetailsResponse(response: SongDetailsResponse): SongDetails {
    return {
      songId: response.song_id,
      title: response.song_title_en || response.song_title_dn || 'Untitled',
      movie: response.album || '',
      release_year: response.release_year,
      singers: response.singers || [],
      composers: response.music_directors || [],
      lyricists: response.lyricist || [],
      actors: response.actors || [],
      categories: response.categories || [],
      lyrics: response.lyrics_text_en || response.lyrics_text_dn || 'Lyrics not available',
      audio_url: response.audio_url,
      video_url: response.video_url,
      imageUrl: undefined
    };
  }
}
