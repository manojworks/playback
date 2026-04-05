import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Song {
  title: string;
  singers: string;
  composers: string;
  movie: string;
  info: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private allSongs: Song[] = [
    {
      title: 'Tum Hi Ho',
      singers: 'Arijit Singh',
      composers: 'Ankit Tiwari',
      movie: 'Aashiqui 2',
      info: 'Play'
    },
    {
      title: 'Tera Ban Jaunga',
      singers: 'Akhil Sachdeva',
      composers: 'Akhil Sachdeva',
      movie: 'Kabali',
      info: 'Play'
    },
    {
      title: 'Shahenshaah',
      singers: 'Rahat Fateh Ali Khan',
      composers: 'Ismail Darbar',
      movie: 'Don 2',
      info: 'Play'
    },
    {
      title: 'Bhool Bhulaiyaa',
      singers: 'Neeraj Shridhar',
      composers: 'Pritam',
      movie: 'Bhool Bhulaiyaa',
      info: 'Play'
    },
    {
      title: 'Kabira',
      singers: 'Arijit Singh, Harshdeep Kaur',
      composers: 'Pritam',
      movie: 'Yeh Jawaani Hai Deewani',
      info: 'Play'
    },
    {
      title: 'Ae Dil Hai Mushkil',
      singers: 'Anushka Sharma, Ranbir Singh',
      composers: 'Pritam',
      movie: 'Ae Dil Hai Mushkil',
      info: 'Play'
    }
  ];

  private searchResultsSubject = new BehaviorSubject<Song[]>(this.allSongs);
  public searchResults$ = this.searchResultsSubject.asObservable();

  constructor() {}

  /**
   * Search songs by query string
   * Filters songs by title, singers, composers, or movie
   * @param query - The search query string
   * @returns Observable of filtered songs
   */
  searchSongs(query: string): Observable<Song[]> {
    const results = this.filterSongs(query);
    this.searchResultsSubject.next(results);
    return this.searchResults$;
  }

  /**
   * Get all songs without filtering
   * @returns Observable of all songs
   */
  getAllSongs(): Observable<Song[]> {
    this.searchResultsSubject.next(this.allSongs);
    return this.searchResults$;
  }

  /**
   * Filter songs by query
   * Searches across title, singers, composers, and movie fields
   * @param query - The search query
   * @returns Filtered array of songs
   */
  private filterSongs(query: string): Song[] {
    if (!query.trim()) {
      return this.allSongs;
    }

    const lowerQuery = query.toLowerCase();
    return this.allSongs.filter(song =>
      song.title.toLowerCase().includes(lowerQuery) ||
      song.singers.toLowerCase().includes(lowerQuery) ||
      song.composers.toLowerCase().includes(lowerQuery) ||
      song.movie.toLowerCase().includes(lowerQuery)
    );
  }
}
