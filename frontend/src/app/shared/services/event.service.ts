import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, EventStats } from '../../core/models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(params?: any): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<any>(this.apiUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event, { withCredentials: true });
  }

  updateEvent(id: string, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event, {
      withCredentials: true,
    });
  }

  deleteEvent(id: string, force: boolean = false): Observable<any> {
    const options: any = {
      withCredentials: true,
    };

    if (force) {
      options.params = { force: 'true' };
    }

    return this.http.delete<any>(`${this.apiUrl}/${id}`, options);
  }

  getEventStats(id: string): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/${id}/stats`, {
      withCredentials: true,
    });
  }
}
