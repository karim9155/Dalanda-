// src/app/services/invoice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceDto } from '../models/invoice-dto';
import { Invoice } from '../models/invoice';
import {FullInvoicePayload} from '../models/full-invoice-payload';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private api = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  createInvoice(payload: FullInvoicePayload): Observable<string> {
    return this.http.post(
      this.api,
      payload,
      {
        headers: this.getAuthHeaders().set('Content-Type','application/json'),
        responseType: 'text'  // ← tell HttpClient you want plain text
      }
    );
  }

  list(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.api, {
      headers: this.getAuthHeaders()
    });
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateInvoice(id: number, dto: InvoiceDto): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.api}/${id}`, dto, {
      headers: this.getAuthHeaders()
    });
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadPdf(id: number, generator: string = 'iText'): Observable<Blob> {
    const url = `${this.api}/${id}/pdf?generator=${generator}`;
    return this.http.get(url, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
  getByUser(userId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.api}/user/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
