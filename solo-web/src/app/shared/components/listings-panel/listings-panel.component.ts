import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { SearchService, type Song } from '../../../core/services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listings-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './listings-panel.component.html',
  styleUrls: ['./listings-panel.component.scss']
})
export class ListingsPanelComponent implements OnInit, OnDestroy {
  private searchService = inject(SearchService);
  private destroy$ = new Subject<void>();
  
  songs: Song[] = [];

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
}
