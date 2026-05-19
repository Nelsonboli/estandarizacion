import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormularioDAAC } from '../interfaces/documento-soporte.interface';

@Injectable({ providedIn: 'root' })
export class FormularioDAACService {

  private baseFormularioDAAC = `${environment.apiUrl}/formulariodaac`;

  constructor(private http: HttpClient) { }

  getFormularioDAAC(): Observable<FormularioDAAC[]> {
    return this.http.get<FormularioDAAC[]>(this.baseFormularioDAAC);
  }

  crearFormularioConDocumento(documentoSoporteId: number, payload: FormularioDAAC) {
    const body = { ...payload, documento_soporte_id: documentoSoporteId };
    return this.http.post<FormularioDAAC>(`${this.baseFormularioDAAC}`, body);
  }

  obtenerPorDocumento(documentoSoporteId: number): Observable<FormularioDAAC> {
    return this.http.get<FormularioDAAC>(`${this.baseFormularioDAAC}/por-documento/${documentoSoporteId}`);
  }

  eliminarFormularioDAAC(id: number): Observable<FormularioDAAC> {
    return this.http.delete<FormularioDAAC>(`${this.baseFormularioDAAC}/${id}`);
  }

  editarFormulario(id: number, payload: Partial<FormularioDAAC>): Observable<FormularioDAAC> {
    return this.http.patch<FormularioDAAC>(`${this.baseFormularioDAAC}/${id}`, payload);
  }


}
