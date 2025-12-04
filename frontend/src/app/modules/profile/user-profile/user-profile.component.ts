import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  error = '';
  currentUser: any = null;
  registrations: any[] = [];
  initialValues: any = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService: ModalService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.registrations = user.registrations || [];
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
        });
        this.initialValues = this.profileForm.value;
        this.loading = false;
      },
      error: async (err) => {
        this.error = err.error?.error || 'Ошибка при загрузке профиля';
        await this.modalService.error('Ошибка', this.error);
        this.loading = false;
      }
    });
  }

  getEventDate(date: string): string {
    return new Date(date).toLocaleDateString('ru-RU');
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'подтверждена': return 'status-confirmed';
      case 'ожидает': return 'status-pending';
      case 'отменена': return 'status-cancelled';
      default: return '';
    }
  }

  isProfileChanged(): boolean {
    const currentValues = this.profileForm.value;
    return JSON.stringify(currentValues) !== JSON.stringify(this.initialValues);
  }

  async onSubmitProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      await this.modalService.error(
        'Ошибка валидации',
        'Пожалуйста, заполните все поля корректно'
      );
      return;
    }

    if (!this.isProfileChanged()) {
      await this.modalService.warning(
        'Нет изменений',
        'Вы не внесли никаких изменений в профиль'
      );
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: async (response) => {
        await this.modalService.success('Успешно!', 'Профиль успешно обновлен');
        this.initialValues = this.profileForm.value;
        this.loading = false;
      },
      error: async (err) => {
        this.error = err.error?.error || 'Ошибка при обновлении профиля';
        await this.modalService.error('Ошибка', this.error);
        this.loading = false;
      },
    });
  }

  async onSubmitPassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      await this.modalService.error(
        'Ошибка валидации',
        'Пожалуйста, заполните все поля корректно'
      );
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      await this.modalService.error(
        'Ошибка',
        'Новый пароль и подтверждение не совпадают'
      );
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.updateProfile(this.passwordForm.value).subscribe({
      next: async (response) => {
        await this.modalService.success('Успешно!', 'Пароль успешно изменен');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: async (err) => {
        this.error = err.error?.error || 'Ошибка при изменении пароля';
        await this.modalService.error('Ошибка', this.error);
        this.loading = false;
      },
    });
  }
}
