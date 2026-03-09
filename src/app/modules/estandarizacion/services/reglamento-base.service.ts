import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReglamentoBaseService {

  private apiUrl = 'http://localhost:3000/reglamento_base';

  constructor(private http: HttpClient) { }

  getReglamentoBase(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearReglamentoBasePorDocumento(documentoSoporteId: number, data: any) {
    const body = { ...data, documento_soporte_id: documentoSoporteId };
    return this.http.post(this.apiUrl, body);
  }

  obtenerReglamentoBasePorDocumento(documentoSoporteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/por-documento/${documentoSoporteId}`);
  }

  ActualizarReglamentoBase(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  EliminarReglamentoBase(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}



