import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormularioDAACService {

  private apiUrl = 'http://localhost:3000/formulariodaac';

  constructor(private http: HttpClient) { }

  getFormularioDAAC(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearFormularioConDocumento(documentoSoporteId: number, payload: any) {
    const body = { ...payload, documento_soporte_id: documentoSoporteId };
    return this.http.post(`${this.apiUrl}`, body);
  }

  obtenerPorDocumento(documentoSoporteId: number) {
    return this.http.get<any>(`${this.apiUrl}/por-documento/${documentoSoporteId}`);
  }

  eliminarFormularioDAAC(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  editarFormulario(id: number, payload: any) {
    return this.http.patch(`${this.apiUrl}/${id}`, payload);
  }


}
