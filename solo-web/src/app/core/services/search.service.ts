import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

/**
 * Song interface
 * Represents a song with array fields for singers and composers
 */
export interface Song {
  title: string;
  singers: string[];
  composers: string[];
  movie: string;
  info: string;
  songId?: string;
  audio_url?: string;
  release_year?: number;
  categories?: string[];
}

/**
 * API Response interface for song search
 * Represents the structure returned from the backend API
 */
interface SongSearchResponse {
  song_id: string;
  song_title_en: string;
  singers: string[];
  music_directors: string[];
  actors: string[];
  lyricist: string[];
  album: string;
  release_year?: number;
  categories: string[];
  audio_url: string;
  video_url?: string;
  lyrics_text_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  /**
   * Cache for search results to avoid repeated API calls
   * Key: search query string
   * Value: array of songs
   */
  private searchCache = new Map<string, Song[]>();

  private searchResultsSubject = new BehaviorSubject<Song[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Search songs by query string
   * Uses cached results if available for the same query, otherwise calls the API
   * @param query - The search query string
   * @returns Observable of filtered songs from the API
   */
  searchSongs(query: string): Observable<Song[]> {
    const trimmedQuery = query.trim();

    // Return empty results if query is empty
    if (!trimmedQuery) {
      this.searchResultsSubject.next([]);
      return this.searchResults$;
    }

    // Check cache first
    if (this.searchCache.has(trimmedQuery)) {
      const cachedResults = this.searchCache.get(trimmedQuery) || [];
      this.searchResultsSubject.next(cachedResults);
      return this.searchResults$;
    }

    // Make API call if not in cache
    const searchUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.search}`;
    console.log('Searching songs:', searchUrl, 'with query:', trimmedQuery);
    return this.http.get(searchUrl, {
      params: { q: trimmedQuery }
    }).pipe(
      map((apiResults: any) => {
        // Handle different response formats
        let resultsArray: SongSearchResponse[] = [];
        if (Array.isArray(apiResults)) {
          resultsArray = apiResults;
        } else if (apiResults && typeof apiResults === 'object') {
          // Check if it's a paginated response (like /api/songs/)
          if ('results' in apiResults && Array.isArray(apiResults.results)) {
            resultsArray = apiResults.results;
          } else {
            // Single object response - wrap in array
            resultsArray = [apiResults as SongSearchResponse];
          }
        }

        // Map API response to Song interface
        const mappedResults = resultsArray.map(result => this.mapSongSearchResponse(result));

        // Store in cache
        this.searchCache.set(trimmedQuery, mappedResults);

        // Update subject
        this.searchResultsSubject.next(mappedResults);

        return mappedResults;
      }),
      catchError(error => {
        console.error('Error searching songs:', error);
        // Return empty array on error
        this.searchResultsSubject.next([]);
        return of([]);
      })
    );
  }

  /**
   * Map API response to Song interface
   * Transforms backend field names to frontend interface
   * @param apiResponse - Song data from the API
   * @returns Mapped Song object
   */
  private mapSongSearchResponse(apiResponse: SongSearchResponse): Song {
    return {
      title: apiResponse.song_title_en || '',
      singers: apiResponse.singers || [],
      composers: apiResponse.music_directors || [],
      movie: apiResponse.album || '',
      info: 'Play',
      songId: apiResponse.song_id,
      audio_url: apiResponse.audio_url,
      release_year: apiResponse.release_year,
      categories: apiResponse.categories || []
    };
  }

  /**
   * Clear the search cache
   * Useful for resetting cached search results
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * Get cache size for debugging purposes
   * @returns Number of cached search queries
   */
  getCacheSize(): number {
    return this.searchCache.size;
  }
}
