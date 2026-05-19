import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentoSoporte } from '../interfaces/documento-soporte.interface';

@Injectable({ providedIn: 'root' })
export class DocumentoSoporteService {
  private baseDocumentoSoporte = `${environment.apiUrl}/documento_soporte`;

  constructor(private http: HttpClient) { }

  getDocumentos(): Observable<DocumentoSoporte[]> {
    return this.http.get<DocumentoSoporte[]>(this.baseDocumentoSoporte);
  }

  findOne(id: number): Observable<DocumentoSoporte> {
    return this.http.get<DocumentoSoporte>(`${this.baseDocumentoSoporte}/${id}`);
  }

  getDocumento(id: number): Observable<DocumentoSoporte> {
    return this.findOne(id);
  }

  crearDocumento(procedimientoId: number) {
    return this.http.post<any>(`${this.baseDocumentoSoporte}/crear-documento/${procedimientoId}`, {});
  }

  getPorProcedimiento(procedimientoId: number) {
    return this.http.get<any>(`${this.baseDocumentoSoporte}/por-procedimiento/${procedimientoId}`);
  }

  actualizarDocumento(id: number, data: any): Observable<DocumentoSoporte> {
    return this.http.put<DocumentoSoporte>(`${this.baseDocumentoSoporte}/${id}`, data);
  }

  eliminarDocumento(id: number): Observable<DocumentoSoporte> {
    return this.http.delete<DocumentoSoporte>(`${this.baseDocumentoSoporte}/${id}`);
  }

}
