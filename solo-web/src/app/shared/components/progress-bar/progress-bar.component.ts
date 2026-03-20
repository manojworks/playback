import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() currentValue: number = 0;
  @Input() max: number = 100;
  @Input() showLabels: boolean = false;
  @Input() ariaLabel: string = 'Progress bar';
  @Output() valueChange = new EventEmitter<number>();

  private isDragging = false;

  onProgressClick(event: MouseEvent): void {
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;
    const newValue = (percentage / 100) * this.max;
    this.valueChange.emit(Math.max(0, Math.min(newValue, this.max)));
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    event.preventDefault();

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isDragging) return;
      this.handleDrag(e);
    };

    const handleEnd = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('touchmove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  }

  private handleDrag(event: MouseEvent | TouchEvent): void {
    const progressContainer = (event.currentTarget as HTMLElement)?.parentElement;
    const rect = progressContainer?.getBoundingClientRect();

    if (!rect) return;

    let clientX: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0]?.clientX ?? 0;
    } else {
      clientX = event.clientX;
    }

    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newValue = (percentage / 100) * this.max;
    this.valueChange.emit(newValue);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
