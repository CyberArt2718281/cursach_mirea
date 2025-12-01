import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'Платформа управления событиями';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Инициализируем AuthService при загрузке приложения
    this.authService.init();
  }
}
