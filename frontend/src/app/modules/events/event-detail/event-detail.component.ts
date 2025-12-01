import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, EventStats } from '../../../core/models/event.model';
import { AuthService } from '../../../shared/services/auth.service';
import { EventService } from '../../../shared/services/event.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  stats: EventStats | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private eventService: EventService,
    private modalService: ModalService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
      this.loadStats(id);
    }
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке события';
        this.loading = false;
        console.error(err);
      },
    });
  }

  loadStats(id: string): void {
    this.eventService.getEventStats(id).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Ошибка при загрузке статистики:', err);
      },
    });
  }

  async deleteEvent(): Promise<void> {
    if (!this.event?._id) return;

    const confirmed = await this.modalService.confirm(
      'Удаление события',
      `Вы уверены, что хотите удалить событие "${this.event.title}"? Это действие необратимо.`
    );

    if (confirmed) {
      this.eventService.deleteEvent(this.event._id).subscribe({
        next: async () => {
          await this.modalService.success(
            'Успешно удалено',
            'Событие успешно удалено'
          );
          this.router.navigate(['/events']);
        },
        error: async (err) => {
          // Если есть активные регистрации, запрашиваем дополнительное подтверждение
          if (
            err.error?.needsConfirmation &&
            err.error?.registrationsCount > 0
          ) {
            const forceConfirm = await this.modalService.confirm(
              '⚠️ Внимание!',
              `У этого события ${err.error.registrationsCount} активных регистраций. При удалении события все регистрации также будут удалены. Продолжить?`
            );

            if (forceConfirm && this.event?._id) {
              // Повторяем запрос с параметром force
              this.eventService.deleteEvent(this.event._id, true).subscribe({
                next: async () => {
                  await this.modalService.success(
                    'Успешно удалено',
                    'Событие и все связанные регистрации успешно удалены'
                  );
                  this.router.navigate(['/events']);
                },
                error: async (forceErr) => {
                  await this.modalService.error(
                    'Ошибка удаления',
                    forceErr.error?.error ||
                      'Не удалось удалить событие. Попробуйте снова.'
                  );
                  console.error(forceErr);
                },
              });
            }
          } else {
            await this.modalService.error(
              'Ошибка удаления',
              err.error?.error ||
                'Не удалось удалить событие. Попробуйте снова.'
            );
            console.error(err);
          }
        },
      });
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
}
