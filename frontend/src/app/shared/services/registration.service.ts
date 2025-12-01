import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Registration } from '../../core/models/registration.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/registrations`;

  constructor(private http: HttpClient) {}

  getRegistrations(params?: any): Observable<any> {
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

  getRegistration(id: string): Observable<Registration> {
    return this.http.get<Registration>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  getRegistrationByNumber(
    registrationNumber: string
  ): Observable<Registration> {
    return this.http.get<Registration>(
      `${this.apiUrl}/number/${registrationNumber}`,
      { withCredentials: true }
    );
  }

  createRegistration(registration: Registration): Observable<Registration> {
    return this.http.post<Registration>(this.apiUrl, registration, {
      withCredentials: true,
    });
  }

  updateRegistration(
    id: string,
    registration: Registration
  ): Observable<Registration> {
    return this.http.put<Registration>(`${this.apiUrl}/${id}`, registration, {
      withCredentials: true,
    });
  }

  markAsAttended(id: string): Observable<Registration> {
    return this.http.patch<Registration>(
      `${this.apiUrl}/${id}/attend`,
      {},
      { withCredentials: true }
    );
  }

  cancelRegistration(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
