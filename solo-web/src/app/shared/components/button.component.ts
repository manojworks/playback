import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent, IconName } from './icon.component';

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      [disabled]="disabled"
      [class]="buttonClass"
      (click)="onClick.emit()"
      [attr.aria-label]="ariaLabel"
    >
      <app-icon
        *ngIf="icon"
        [name]="icon"
        [size]="size"
      ></app-icon>
      <span *ngIf="label">{{ label }}</span>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      transform: translateY(-2px);
    }

    button:not(:disabled):active {
      transform: translateY(0);
    }

    /* Size variants */
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .btn-md {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }

    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.125rem;
    }

    /* Color variants */
    .btn-primary {
      background-color: var(--color-blue);
      color: white;
    }

    .btn-primary:not(:disabled):hover {
      background-color: var(--color-violet);
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--color-blue);
      border: 2px solid var(--color-blue);
    }

    .btn-secondary:not(:disabled):hover {
      background-color: var(--color-blue);
      color: white;
    }

    .btn-danger {
      background-color: var(--color-red);
      color: white;
    }

    .btn-danger:not(:disabled):hover {
      background-color: var(--color-red-dark);
    }

    .btn-ghost {
      background-color: transparent;
      color: inherit;
    }

    .btn-ghost:not(:disabled):hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class ButtonComponent implements OnInit {
  @Input() label: string = '';
  @Input() icon?: IconName;
  @Input() size: ButtonSize = 'md';
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() ariaLabel?: string;
  @Output() onClick = new EventEmitter<void>();

  buttonClass: string = '';

  ngOnInit(): void {
    this.buttonClass = `btn-${this.size} btn-${this.variant}`;
  }
}
