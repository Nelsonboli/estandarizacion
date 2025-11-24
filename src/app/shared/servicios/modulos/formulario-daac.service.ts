import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormularioDAACService {

  private base = 'http://localhost:3000/formulariodaac';

  constructor(private http: HttpClient) {}

  getFormularioDAAC(): Observable<any[]> {
    return this.http.get<any[]>(this.base);
  }

  crearFormularioConDocumento(documentoSoporteId: number, payload: any) {
    const body = { ...payload, documento_soporte_id: documentoSoporteId };
    return this.http.post(`${this.base}`, body);
  }

  obtenerPorDocumento(documentoSoporteId: number) {
    return this.http.get<any>(`${this.base}/por-documento/${documentoSoporteId}`);
  }

  eliminarFormularioDAAC(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }

  editarFormulario(id: number, payload: any) {
    return this.http.put(`${this.base}/${id}`, payload);
  }

 BuscarFormularioDAAC(id: number): Observable<any > {
  return this.http.get<any >(`${this.base}/por-documento/${id}`);
}

}
