import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'confirm' | 'alert' | 'success' | 'error' | 'warning';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @Input() config: ModalConfig = {
    title: '',
    message: '',
    type: 'alert',
    confirmText: 'OK',
    cancelText: 'Отмена',
    showCancel: false,
  };

  @Input() isOpen = false;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }

  close() {
    this.isOpen = false;
    this.closed.emit();
  }

  getIcon(): string {
    switch (this.config.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  }

  getIconClass(): string {
    return `modal-icon-${this.config.type}`;
  }
}
