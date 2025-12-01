import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../shared/services/event.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  loading = false;
  error = '';
  initialValues: any = {};

  categories = [
    'конференция',
    'семинар',
    'вебинар',
    'мастер-класс',
    'выставка',
    'концерт',
    'спорт',
    'другое',
  ];
  statuses = ['активное', 'отменено', 'завершено', 'черновик'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private modalService: ModalService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      date: ['', Validators.required],
      endDate: [''],
      location: ['', [Validators.required, Validators.maxLength(300)]],
      category: ['другое', Validators.required],
      capacity: [50, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      status: ['активное', Validators.required],
      organizerName: ['', Validators.required],
      organizerEmail: ['', [Validators.required, Validators.email]],
      organizerPhone: [''],
      registrationDeadline: [''],
      tags: [''],
    });
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEvent(this.eventId);
    }
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          date: this.formatDateForInput(event.date),
          endDate: event.endDate ? this.formatDateForInput(event.endDate) : '',
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          price: event.price,
          imageUrl: event.imageUrl,
          status: event.status,
          organizerName: event.organizer.name,
          organizerEmail: event.organizer.email,
          organizerPhone: event.organizer.phone,
          registrationDeadline: event.registrationDeadline
            ? this.formatDateForInput(event.registrationDeadline)
            : '',
          tags: event.tags ? event.tags.join(', ') : '',
        });
        this.initialValues = this.eventForm.value;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке события';
        this.loading = false;
        console.error(err);
      },
    });
  }

  formatDateForInput(date: any): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  isFormChanged(): boolean {
    if (!this.isEditMode) {
      return true;
    }
    const currentValues = this.eventForm.value;
    return JSON.stringify(currentValues) !== JSON.stringify(this.initialValues);
  }

  async onSubmit(): Promise<void> {
    // Проверка изменений формы в режиме редактирования
    if (this.isEditMode && !this.isFormChanged()) {
      await this.modalService.warning(
        'Нет изменений',
        'Вы не внесли никаких изменений в событие'
      );
      return;
    }

    // Проверка валидности формы
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();

      const invalidFields: string[] = [];
      Object.keys(this.eventForm.controls).forEach((key) => {
        const control = this.eventForm.controls[key];
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

    const formValue = this.eventForm.value;
    const eventData: Event = {
      title: formValue.title,
      description: formValue.description,
      date: formValue.date,
      endDate: formValue.endDate || undefined,
      location: formValue.location,
      category: formValue.category,
      capacity: formValue.capacity,
      availableSeats: formValue.capacity,
      price: formValue.price,
      imageUrl: formValue.imageUrl || '',
      status: formValue.status,
      organizer: {
        name: formValue.organizerName,
        email: formValue.organizerEmail,
        phone: formValue.organizerPhone || '',
      },
      registrationDeadline: formValue.registrationDeadline || undefined,
      tags: formValue.tags
        ? formValue.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : [],
    };

    const request =
      this.isEditMode && this.eventId
        ? this.eventService.updateEvent(this.eventId, eventData)
        : this.eventService.createEvent(eventData);

    request.subscribe({
      next: async (event) => {
        await this.modalService.success(
          'Успешно!',
          this.isEditMode
            ? 'Событие успешно обновлено'
            : 'Событие успешно создано'
        );
        this.router.navigate(['/events', event._id]);
      },
      error: async (err) => {
        this.error = 'Ошибка при сохранении события';
        this.loading = false;
        await this.modalService.error(
          'Ошибка',
          err.error?.message ||
            'Не удалось сохранить событие. Попробуйте снова.'
        );
        console.error(err);
      },
    });
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Название',
      description: 'Описание',
      date: 'Дата начала',
      location: 'Место проведения',
      category: 'Категория',
      capacity: 'Вместимость',
      price: 'Цена',
      status: 'Статус',
      organizerName: 'Имя организатора',
      organizerEmail: 'Email организатора',
    };
    return labels[fieldName] || fieldName;
  }
}
