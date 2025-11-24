import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DocumentoSoporteService {
  private base = 'http://localhost:3000/documento-soporte';

  constructor(private http: HttpClient) {}

  crearDocumento(procedimientoId: number) {
    return this.http.post<any>(`${this.base}/crear-documento/${procedimientoId}`, {});
  }

  getPorProcedimiento(procedimientoId: number) {
    return this.http.get<any>(`${this.base}/por-procedimiento/${procedimientoId}`);
  }
}
