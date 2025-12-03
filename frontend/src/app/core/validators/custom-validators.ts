import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Регулярные выражения
  static readonly EMAIL_PATTERN =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  static readonly PHONE_PATTERN = /^(\+7|8|7)?[\s\-]?\d{10}$/;
  static readonly USERNAME_PATTERN = /^[a-zA-Z0-9_а-яА-ЯёЁ]{3,20}$/;
  static readonly NAME_PATTERN = /^[a-zA-Zа-яА-ЯёЁ\s\-]{2,50}$/;
  static readonly URL_PATTERN =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  static readonly PASSWORD_PATTERN =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Валидатор для email с улучшенной проверкой
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.EMAIL_PATTERN.test(control.value);
      return valid ? null : { email: { value: control.value } };
    };
  }

  // Валидатор для телефона (российский формат)
  static phone(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.PHONE_PATTERN.test(control.value);
      return valid ? null : { phone: { value: control.value } };
    };
  }

  // Валидатор для имени пользователя
  static username(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.USERNAME_PATTERN.test(control.value);
      return valid ? null : { username: { value: control.value } };
    };
  }

  // Валидатор для имен (имя, фамилия)
  static personName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.NAME_PATTERN.test(control.value);
      return valid ? null : { personName: { value: control.value } };
    };
  }

  // Валидатор для URL
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.URL_PATTERN.test(control.value);
      return valid ? null : { url: { value: control.value } };
    };
  }

  // Валидатор для сильного пароля
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const valid = CustomValidators.PASSWORD_PATTERN.test(control.value);
      return valid ? null : { strongPassword: { value: control.value } };
    };
  }

  // Валидатор для проверки совпадения паролей
  static passwordMatch(
    passwordField: string,
    confirmPasswordField: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordField);
      const confirmPassword = formGroup.get(confirmPasswordField);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.errors['passwordMatch']) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMatch: true });
        return { passwordMatch: true };
      } else {
        confirmPassword.setErrors(null);
        return null;
      }
    };
  }

  // Валидатор для проверки минимального значения числа
  static minValue(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      const value = Number(control.value);
      return value >= min ? null : { minValue: { min, actual: value } };
    };
  }

  // Валидатор для проверки максимального значения числа
  static maxValue(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      const value = Number(control.value);
      return value <= max ? null : { maxValue: { max, actual: value } };
    };
  }

  // Валидатор для проверки диапазона чисел
  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) {
        return null;
      }
      const value = Number(control.value);
      const valid = value >= min && value <= max;
      return valid ? null : { range: { min, max, actual: value } };
    };
  }

  // Валидатор для проверки даты (не в прошлом)
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const inputDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return inputDate >= today
        ? null
        : { futureDate: { value: control.value } };
    };
  }

  // Валидатор для проверки, что дата окончания позже даты начала
  static dateRange(startDateField: string, endDateField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startDateField);
      const endDate = formGroup.get(endDateField);

      if (!startDate || !endDate || !endDate.value) {
        return null;
      }

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);

      if (end <= start) {
        endDate.setErrors({ dateRange: true });
        return { dateRange: true };
      } else {
        if (endDate.errors && endDate.errors['dateRange']) {
          delete endDate.errors['dateRange'];
          if (Object.keys(endDate.errors).length === 0) {
            endDate.setErrors(null);
          }
        }
        return null;
      }
    };
  }

  // Валидатор для проверки текста без специальных символов
  static noSpecialChars(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const pattern = /^[a-zA-Zа-яА-ЯёЁ0-9\s\-,.!?()]+$/;
      const valid = pattern.test(control.value);
      return valid ? null : { noSpecialChars: { value: control.value } };
    };
  }

  // Валидатор для организации
  static organization(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const pattern = /^[a-zA-Zа-яА-ЯёЁ0-9\s\-,.«»""'"()]+$/;
      const valid = pattern.test(control.value) && control.value.length >= 2;
      return valid ? null : { organization: { value: control.value } };
    };
  }

  // Валидатор для должности
  static position(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const pattern = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
      const valid = pattern.test(control.value) && control.value.length >= 2;
      return valid ? null : { position: { value: control.value } };
    };
  }
}
