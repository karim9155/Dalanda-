// src/app/services/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/invoice';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private api = 'http://localhost:8080/api/companies';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(this.api, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(company: Company): Observable<Company> {
    return this.http.post<Company>(this.api, company, {
      headers: this.getAuthHeaders()
    });
  }

  update(id: number, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.api}/${id}`, company, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  uploadLogo(id: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<void>(`${this.api}/${id}/logo`, form, {
      headers: this.getAuthHeaders()
    });
  }

  uploadStamp(id: number, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<void>(`${this.api}/${id}/stamp`, form, {
      headers: this.getAuthHeaders()
    });
  }
}
