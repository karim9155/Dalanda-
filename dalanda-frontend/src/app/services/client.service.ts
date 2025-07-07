// src/app/services/client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/invoice';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private api = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.get() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  list(): Observable<Client[]> {
    return this.http.get<Client[]>(this.api, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.api, client, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.api}/${id}`, client, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
