import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../shared/services/event.service';
import { ModalService } from '../../../shared/services/modal.service';
import { RegistrationService } from '../../../shared/services/registration.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent implements OnInit {
  registrationForm: FormGroup;
  event: Event | null = null;
  loading = false;
  error = '';
  success = false;
  registrationNumber = '';
  qrCodeData = '';
  participantEmail = '';

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private eventService: EventService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      organization: ['', Validators.maxLength(200)],
      position: ['', Validators.maxLength(100)],
      notes: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.loadEvent(eventId);
    }
  }

  loadEvent(id: string): void {
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event = event;
        if (event.availableSeats === 0) {
          this.error = 'К сожалению, все места на это событие заняты';
        }
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке события';
        console.error(err);
      },
    });
  }

  async onSubmit(): Promise<void> {
    // Проверка валидности формы
    if (this.registrationForm.invalid || !this.event?._id) {
      this.registrationForm.markAllAsTouched();

      const invalidFields: string[] = [];
      Object.keys(this.registrationForm.controls).forEach((key) => {
        const control = this.registrationForm.controls[key];
        if (control.invalid) {
          invalidFields.push(this.getFieldLabel(key));
        }
      });

      await this.modalService.error(
        'Ошибка валидации',
        `Пожалуйста, заполните все обязательные поля корректно:\n${invalidFields.join(
          ', '
        )}`
      );
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = this.registrationForm.value;
    const registrationData: any = {
      eventId: this.event._id,
      participant: {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        organization: formValue.organization || undefined,
        position: formValue.position || undefined,
      },
      notes: formValue.notes || undefined,
    };

    this.registrationService.createRegistration(registrationData).subscribe({
      next: (registration) => {
        this.success = true;
        this.registrationNumber = registration.registrationNumber || '';
        this.participantEmail = formValue.email;

        // Генерируем данные для QR-кода
        this.qrCodeData = JSON.stringify({
          registrationNumber: this.registrationNumber,
          eventId: this.event?._id,
          eventTitle: this.event?.title,
          participantEmail: formValue.email,
          eventDate: this.event?.date,
        });

        this.loading = false;
        this.registrationForm.reset();
      },
      error: async (err) => {
        this.error = err.error?.error || 'Ошибка при регистрации';
        this.loading = false;
        await this.modalService.error('Ошибка регистрации', this.error);
        console.error(err);
      },
    });
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Имя',
      lastName: 'Фамилия',
      email: 'Email',
      phone: 'Телефон',
    };
    return labels[fieldName] || fieldName;
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
