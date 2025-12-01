import { Component, OnInit } from '@angular/core';
import { Event } from '../../../core/models/event.model';
import { EventService } from '../../../shared/services/event.service';
import { RegistrationService } from '../../../shared/services/registration.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  events: Event[] = [];
  recentRegistrations: any[] = [];
  loading = false;

  stats = {
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalCapacity: 0,
    totalOccupied: 0,
  };

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Загружаем события
    this.eventService.getEvents({ limit: 100, status: '' }).subscribe({
      next: (response) => {
        this.events = response.events;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка при загрузке событий:', err);
        this.loading = false;
      },
    });

    // Загружаем последние регистрации
    this.registrationService.getRegistrations({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentRegistrations = response.registrations;
      },
      error: (err) => {
        console.error('Ошибка при загрузке регистраций:', err);
      },
    });
  }

  calculateStats(): void {
    this.stats.totalEvents = this.events.length;
    this.stats.activeEvents = this.events.filter(
      (e) => e.status === 'активное'
    ).length;

    this.stats.totalCapacity = this.events.reduce(
      (sum, e) => sum + e.capacity,
      0
    );
    this.stats.totalOccupied = this.events.reduce(
      (sum, e) => sum + (e.capacity - e.availableSeats),
      0
    );

    // Загружаем общее количество регистраций
    this.registrationService.getRegistrations({ limit: 1 }).subscribe({
      next: (response) => {
        this.stats.totalRegistrations = response.pagination.total;
      },
    });
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getEventTitle(event: any): string {
    return typeof event === 'object' ? event.title : 'Н/Д';
  }

  getOccupancyRate(event: Event): number {
    return Math.round(
      ((event.capacity - event.availableSeats) / event.capacity) * 100
    );
  }
}
