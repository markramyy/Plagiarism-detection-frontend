import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration: number = 5000) {
    const toast: Toast = {
      id: this.generateId(),
      message,
      type,
      title,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: string) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  showSuccess(message: string, title?: string, duration: number = 5000) {
    this.showToast(message, 'success', title, duration);
  }

  showError(message: string, title?: string, duration: number = 8000) {
    this.showToast(message, 'error', title, duration);
  }

  showWarning(message: string, title?: string, duration: number = 6000) {
    this.showToast(message, 'warning', title, duration);
  }

  showInfo(message: string, title?: string, duration: number = 5000) {
    this.showToast(message, 'info', title, duration);
  }
}
