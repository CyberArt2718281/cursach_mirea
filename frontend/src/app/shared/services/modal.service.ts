import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalConfig } from '../components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new BehaviorSubject<{
    config: ModalConfig | null;
    isOpen: boolean;
  }>({
    config: null,
    isOpen: false,
  });

  public modal$ = this.modalSubject.asObservable();
  private resolvePromise?: (value: boolean) => void;

  confirm(title: string, message: string): Promise<boolean> {
    return this.openModal({
      title,
      message,
      type: 'confirm',
      confirmText: 'Подтвердить',
      cancelText: 'Отмена',
      showCancel: true,
    });
  }

  alert(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'alert' = 'alert'
  ): Promise<boolean> {
    return this.openModal({
      title,
      message,
      type,
      confirmText: 'OK',
      showCancel: false,
    });
  }

  success(title: string, message: string): Promise<boolean> {
    return this.alert(title, message, 'success');
  }

  error(title: string, message: string): Promise<boolean> {
    return this.alert(title, message, 'error');
  }

  warning(title: string, message: string): Promise<boolean> {
    return this.alert(title, message, 'warning');
  }

  private openModal(config: ModalConfig): Promise<boolean> {
    this.modalSubject.next({ config, isOpen: true });

    return new Promise<boolean>((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  handleConfirm() {
    if (this.resolvePromise) {
      this.resolvePromise(true);
    }
    this.close();
  }

  handleCancel() {
    if (this.resolvePromise) {
      this.resolvePromise(false);
    }
    this.close();
  }

  close() {
    this.modalSubject.next({ config: null, isOpen: false });
    this.resolvePromise = undefined;
  }
}
