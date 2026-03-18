import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerRoutingModule } from './music-player-routing.module';
import { PlayerComponent } from './components';

@NgModule({
  imports: [CommonModule, MusicPlayerRoutingModule, PlayerComponent]
})
export class MusicPlayerModule {}
