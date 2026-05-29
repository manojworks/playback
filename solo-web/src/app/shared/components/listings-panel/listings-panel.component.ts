import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SearchService, SongService, type Song, type SongDetails } from '../../../core/services';
import { SongDetailsPopupComponent } from '../song-details-popup/song-details-popup.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listings-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule, SongDetailsPopupComponent],
  templateUrl: './listings-panel.component.html',
  styleUrls: ['./listings-panel.component.scss']
})
export class ListingsPanelComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private songService = inject(SongService);
  private destroy$ = new Subject<void>();
  
  songs: Song[] = [];
  selectedSongDetails: SongDetails | null = null;
  isLoadingDetails = false;

  ngOnInit(): void {
    // Subscribe to search results - empty by default
    this.searchService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.songs = results;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDetails(song: Song): void {
    if (!song.songId) {
      console.warn('Song details not available for', song);
      return;
    }

    this.isLoadingDetails = true;
    this.songService.getSongDetails(song.songId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        this.selectedSongDetails = details;
        this.isLoadingDetails = false;
      });
  }

  closeDetails(): void {
    this.selectedSongDetails = null;
  }

  onLyrics(song: Song): void {
    console.log('Lyrics action clicked', song);
  }

  onPlay(song: Song): void {
    console.log('Play action clicked', song);
  }

  onRecord(song: Song): void {
    console.log('Record action clicked', song);
  }

  onLike(song: Song): void {
    console.log('Like action clicked', song);
  }
}
