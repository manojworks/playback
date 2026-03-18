import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/music-player/music-player.routes').then(
        m => m.MUSIC_PLAYER_ROUTES
      )
  }
];
