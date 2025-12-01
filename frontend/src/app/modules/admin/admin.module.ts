import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminRoutingModule } from './admin-routing.module';
import { EventFormComponent } from './event-form/event-form.component';
import { RegistrationListComponent } from './registration-list/registration-list.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    EventFormComponent,
    RegistrationListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    AdminRoutingModule,
  ],
})
export class AdminModule {}
