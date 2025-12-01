import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventsRoutingModule } from './events-routing.module';

@NgModule({
  declarations: [EventListComponent, EventDetailComponent],
  imports: [CommonModule, FormsModule, EventsRoutingModule],
})
export class EventsModule {}
