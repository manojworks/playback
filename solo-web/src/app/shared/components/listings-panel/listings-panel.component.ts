import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

interface Song {
  title: string;
  singers: string;
  composers: string;
  movie: string;
  info: string;
}

@Component({
  selector: 'app-listings-panel',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './listings-panel.component.html',
  styleUrls: ['./listings-panel.component.scss']
})
export class ListingsPanelComponent {
  songs: Song[] = [
    {
      title: 'Tum Hi Ho',
      singers: 'Arijit Singh',
      composers: 'Ankit Tiwari',
      movie: 'Aashiqui 2',
      info: 'Play'
    },
    {
      title: 'Song kjj',
      singers: 'Manjo  Singh',
      composers: 'Shalj Tiwari',
      movie: 'Jhaih 2',
      info: 'Sing'
    }
  ];
}
