import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      await this.modalService.error(
        'Ошибка валидации',
        'Пожалуйста, заполните все поля корректно'
      );
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      await this.modalService.error(
        'Ошибка',
        'Пароли не совпадают'
      );
      return;
    }

    this.loading = true;
    this.error = '';

    const { username, email } = this.registerForm.value;

    this.authService.register({ username, email, password }).subscribe({
      next: async (response) => {
        await this.modalService.success(
          'Успешно!',
          'Регистрация прошла успешно. Добро пожаловать!'
        );
        this.router.navigate(['/profile']);
      },
      error: async (err) => {
        this.error = err.error?.error || 'Ошибка при регистрации';
        await this.modalService.error('Ошибка', this.error);
        this.loading = false;
      },
    });
  }
}
