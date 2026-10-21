import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/app.tokens';
import { Dashboard } from '../models/dashboard.model';
import { Lead, LeadPayload, StatusLead } from '../models/lead.model';

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG).baseUrl;

  /** Público: formulário "Tenho interesse" / contato. */
  enviar(payload: LeadPayload): Observable<Lead> {
    return this.http.post<Lead>(`${this.api}/leads`, payload);
  }

  listar(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.api}/admin/leads`);
  }

  alterarStatus(id: string, status: StatusLead): Observable<Lead> {
    return this.http.patch<Lead>(`${this.api}/admin/leads/${id}`, { status });
  }

  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/admin/dashboard`);
  }

  restaurarDados(): Observable<void> {
    return this.http.post<void>(`${this.api}/admin/restaurar`, {});
  }
}
