import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstandarizacionService {
  private apiUrl = 'http://localhost:3000'; // tu URL backend

  constructor(private http: HttpClient) {}

  // Obtener todos los datos relacionados con un procedimiento
  getEstandarizacionPorProcedimiento(id: number): Observable<any> {
    const doc = this.http.get(`${this.apiUrl}/documento-soporte/${id}`);
    const soporte = this.http.get(`${this.apiUrl}/soporte-computacional/${id}`);
    const reglamento = this.http.get(`${this.apiUrl}/reglamento/${id}`);

    return forkJoin({ doc, soporte, reglamento });
  }

  // Guardar Documento de Soporte
  guardarDocumentoSoporte(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/documento-soporte/${id}`, data);
  }

  // Guardar Soporte Computacional
  guardarSoporteComputacional(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/soporte-computacional/${id}`, data);
  }

  // Guardar Reglamento
  guardarReglamento(id: number, data: any) {
    return this.http.post(`${this.apiUrl}/reglamento/${id}`, data);
  }

  obtenerDocumentoPorProcedimiento(procedimientoId: number) {
  return this.http.get<any>(`${this.apiUrl}/documento-soporte/por-procedimiento/${procedimientoId}`);
}
}
