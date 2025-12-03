import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ModalComponent } from './shared/components/modal/modal.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { AuthService } from './shared/services/auth.service';

export function initializeApp(authService: AuthService) {
  return () => {
    // Пытаемся загрузить профиль при старте приложения
    return lastValueFrom(authService.getProfile())
      .then((user) => {
        console.log('✅ Пользователь авторизован:', user);
      })
      .catch(() => {
        console.log('ℹ️ Пользователь не авторизован');
      });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ModalComponent,
    FooterComponent,
    LayoutComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
