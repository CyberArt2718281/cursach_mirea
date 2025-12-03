import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../shared/services/event.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error = '';

  // Фильтры
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
  selectedCategory = '';
  selectedStatus = 'активное';
  searchQuery = '';

  // Пагинация
  currentPage = 1;
  totalPages = 1;
  totalEvents = 0;

  constructor(private eventService: EventService, public router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';

    const params: any = {
      page: this.currentPage,
      limit: 9,
      status: this.selectedStatus,
    };

    if (this.selectedCategory) {
      params.category = this.selectedCategory;
    }

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.eventService.getEvents(params).subscribe({
      next: (response) => {
        this.events = response.events;
        this.totalPages = response.pagination.pages;
        this.totalEvents = response.pagination.total;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Ошибка при загрузке событий';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSearch(): void {
    // Не фильтруем, если поле пустое
    if (this.searchQuery.trim() === '') {
      return;
    }
    this.currentPage = 1;
    this.loadEvents();
  }

  onFilterChange(): void {
    // Сбрасываем поисковый запрос при изменении фильтров
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadEvents();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEvents();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEvents();
    }
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getBackgroundImage(event: any): string {
    const defaultGradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];

    if (event.imageUrl) {
      return `url('${event.imageUrl}')`;
    }

    // Используем хеш от ID для выбора градиента
    const hash = event._id ? event._id.charCodeAt(0) : 0;
    const gradient = defaultGradients[hash % defaultGradients.length];
    return gradient;
  }
}
