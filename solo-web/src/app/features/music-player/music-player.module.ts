import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerRoutingModule } from './music-player-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  imports: [CommonModule, MusicPlayerRoutingModule, DashboardComponent]
})
export class MusicPlayerModule {}
