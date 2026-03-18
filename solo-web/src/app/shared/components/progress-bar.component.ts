import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container" (click)="onProgressClick($event)" [attr.aria-label]="ariaLabel">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          [style.width.%]="currentValue"
        ></div>
        <div 
          class="progress-thumb" 
          [style.left.%]="currentValue"
          (mousedown)="startDrag($event)"
          (touchstart)="startDrag($event)"
        ></div>
      </div>
      <div *ngIf="showLabels" class="progress-labels">
        <span class="current-time">{{ formatTime(currentValue * max / 100) }}</span>
        <span class="max-time">{{ formatTime(max) }}</span>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      cursor: pointer;
    }

    .progress-bar {
      position: relative;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-blue), var(--color-pink));
      transition: width 0.1s linear;
      border-radius: 3px;
    }

    .progress-thumb {
      position: absolute;
      top: 50%;
      width: 14px;
      height: 14px;
      background-color: white;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .progress-bar:hover .progress-thumb {
      opacity: 1;
    }

    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .current-time {
      font-weight: 500;
    }

    .max-time {
      text-align: right;
    }
  `]
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
