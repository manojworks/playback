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
  template: `
    <section class="bg-white/80 backdrop-blur-md rounded-lg shadow-sm mx-4 mb-4">
      <div class="overflow-x-auto">
        <table class="w-full table-fixed">
          <thead>
            <tr class="border-b-2 border-gray-300 bg-gray-50">
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-800 w-1/5">Title</th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-800 w-1/5">Singers</th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-800 w-1/5">Composers</th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-800 w-1/5">Movie</th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-800 w-1/5">Info</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let song of songs" class="border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer">
              <td class="py-3 px-4 text-sm text-gray-700 truncate">{{ song.title }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 truncate">{{ song.singers }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 truncate">{{ song.composers }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 truncate">{{ song.movie }}</td>
              <td class="py-3 px-4 text-sm text-gray-700 truncate">{{ song.info }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;
    }

    thead tr {
      background-color: rgba(0, 0, 0, 0.03);
    }

    th {
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 2px solid #d1d5db;
      color: #1f2937;
    }

    td {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #374151;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    tbody tr {
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s ease;
    }

    tbody tr:hover {
      background-color: rgba(59, 130, 246, 0.05);
    }
  `]
})
export class ListingsPanelComponent {
  songs: Song[] = [
    {
      title: 'Tum Hi Ho',
      singers: 'Arijit Singh',
      composers: 'Ankit Tiwari',
      movie: 'Aashiqui 2',
      info: 'Play'
    }
  ];
}
