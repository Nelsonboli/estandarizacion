import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ReglamentoBase } from '../interfaces/documento-soporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReglamentoBaseService {

  private baseReglamentoBase = `${environment.apiUrl}/reglamento_base`;

  constructor(private http: HttpClient) { }

  getReglamentoBase(): Observable<ReglamentoBase[]> {
    return this.http.get<ReglamentoBase[]>(this.baseReglamentoBase);
  }

  crearReglamentoBasePorDocumento(documentoSoporteId: number, data: Partial<ReglamentoBase>) {
    const body = { ...data, documento_soporte_id: documentoSoporteId };
    return this.http.post<ReglamentoBase>(this.baseReglamentoBase, body);
  }

  obtenerReglamentoBasePorDocumento(documentoSoporteId: number): Observable<ReglamentoBase[]> {
    return this.http.get<ReglamentoBase[]>(`${this.baseReglamentoBase}/por-documento/${documentoSoporteId}`);
  }

  ActualizarReglamentoBase(id: number, data: Partial<ReglamentoBase>): Observable<ReglamentoBase> {
    return this.http.patch<ReglamentoBase>(`${this.baseReglamentoBase}/${id}`, data);
  }

  EliminarReglamentoBase(id: number): Observable<any> {
    return this.http.delete(`${this.baseReglamentoBase}/${id}`);
  }

}



