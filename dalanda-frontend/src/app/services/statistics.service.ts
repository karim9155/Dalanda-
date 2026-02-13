import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NameValue {
  name: string;
  value: number;
}

export interface ChartData {
  name: string;
  series: NameValue[];
}

export interface Stats {
  invoicesByStatus: NameValue[];
  monthlySales: ChartData[];
  topClients: NameValue[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<Stats> {
    return this.http.get<Stats>(this.apiUrl);
  }
}
