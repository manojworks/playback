import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, ProgressBarComponent, IconComponent } from './components';

@NgModule({
  imports: [CommonModule, ButtonComponent, ProgressBarComponent, IconComponent],
  exports: [ButtonComponent, ProgressBarComponent, IconComponent]
})
export class SharedModule {}
