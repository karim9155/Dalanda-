import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, switchMap, tap} from 'rxjs';

export interface LoginResponse {
  token: string;
  user: { id: string; username: string; /* …other props… */ };
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    // 1) hit /login
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        // 2) store the token immediately
        tap(res => localStorage.setItem('jwtToken', res.token)),

        // 3) now fetch /users/me using that token
        switchMap(res =>
          this.http
            .get<{ id: string }>(`${this.apiUrl}/users/me`, {
              headers: { Authorization: `Bearer ${res.token}` }
            })
            .pipe(
              // 4) stash the UUID
              tap(me => localStorage.setItem('userUuid', me.id)),
              // 5) pass the original login response through
              map(() => res)
            )
        )
      );
  }
  register(username: string, password: string, roles: string[]) {
    return this.http.post(`${this.apiUrl}/register`, { username, password, roles });
  }
}
