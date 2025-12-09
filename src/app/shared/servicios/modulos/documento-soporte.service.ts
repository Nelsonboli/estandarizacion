import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentoSoporteService {
  private base = 'http://localhost:3000/documento_soporte';

  constructor(private http: HttpClient) { }

  crearDocumento(procedimientoId: number) {
    return this.http.post<any>(`${this.base}/crear-documento/${procedimientoId}`, {});
  }

  getPorProcedimiento(procedimientoId: number) {
    return this.http.get<any>(`${this.base}/por-procedimiento/${procedimientoId}`);
  }

  actualizarDocumento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, data);
  }

  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
