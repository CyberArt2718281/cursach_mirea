import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { LayoutComponent } from './shared/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: '/events', pathMatch: 'full' },
      {
        path: 'events',
        loadChildren: () =>
          import('./modules/events').then((m) => m.EventsModule),
      },
      {
        path: 'register',
        loadChildren: () =>
          import('./modules/registration').then((m) => m.RegistrationModule),
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./modules/profile').then((m) => m.ProfileModule),
      },
      {
        path: 'login',
        canActivate: [LoginGuard],
        loadChildren: () => import('./modules/auth').then((m) => m.AuthModule),
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () =>
          import('./modules/admin').then((m) => m.AdminModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
