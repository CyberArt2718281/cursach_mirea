import { Component, OnInit } from '@angular/core';
import { Registration } from '../../../core/models/registration.model';
import { ModalService } from '../../../shared/services/modal.service';
import { RegistrationService } from '../../../shared/services/registration.service';

@Component({
  selector: 'app-registration-list',
  templateUrl: './registration-list.component.html',
  styleUrls: ['./registration-list.component.css'],
})
export class RegistrationListComponent implements OnInit {
  registrations: Registration[] = [];
  loading = false;
  error = '';

  // Фильтры
  selectedStatus = '';
  searchQuery = '';

  // Пагинация
  currentPage = 1;
  totalPages = 1;
  totalRegistrations = 0;

  constructor(
    private registrationService: RegistrationService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      limit: 20,
    };

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.registrationService.getRegistrations(params).subscribe({
      next: (response) => {
        this.registrations = response.registrations;
        this.totalPages = response.pagination.pages;
        this.totalRegistrations = response.pagination.total;
        this.loading = false;

        // Отладка: проверяем наличие _id
        console.log('Loaded registrations:', this.registrations);
        console.log('First registration _id:', this.registrations[0]?._id);
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке регистраций';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRegistrations();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRegistrations();
  }

  async markAsAttended(id: string): Promise<void> {
    console.log('markAsAttended called with id:', id);

    if (!id) {
      await this.modalService.error('Ошибка', 'ID регистрации не найден');
      return;
    }

    const confirmed = await this.modalService.confirm(
      'Подтверждение посещения',
      'Отметить участника как посетившего событие?'
    );

    if (confirmed) {
      this.registrationService.markAsAttended(id).subscribe({
        next: async () => {
          await this.modalService.success(
            'Успешно',
            'Участник отмечен как посетивший'
          );
          this.loadRegistrations();
        },
        error: async (err) => {
          await this.modalService.error(
            'Ошибка',
            err.error?.message ||
              'Не удалось обновить статус. Попробуйте снова.'
          );
          console.error(err);
        },
      });
    }
  }

  async cancelRegistration(id: string): Promise<void> {
    console.log('cancelRegistration called with id:', id);

    if (!id) {
      await this.modalService.error('Ошибка', 'ID регистрации не найден');
      return;
    }

    const confirmed = await this.modalService.confirm(
      'Отмена регистрации',
      'Вы уверены, что хотите отменить эту регистрацию? Это действие необратимо.'
    );

    if (confirmed) {
      this.registrationService.cancelRegistration(id).subscribe({
        next: async () => {
          await this.modalService.success(
            'Успешно',
            'Регистрация успешно отменена'
          );
          this.loadRegistrations();
        },
        error: async (err) => {
          await this.modalService.error(
            'Ошибка',
            err.error?.message ||
              'Не удалось отменить регистрацию. Попробуйте снова.'
          );
          console.error(err);
        },
      });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRegistrations();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRegistrations();
    }
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

  getEventTitle(event: any): string {
    return event && typeof event === 'object' && event.title
      ? event.title
      : 'Н/Д';
  }
}
