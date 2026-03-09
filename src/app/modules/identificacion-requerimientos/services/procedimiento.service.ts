import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Procedimiento } from '../interfaces/procedimiento.interface';


@Injectable({
  providedIn: 'root'
})
export class ProcedimientoService {
  private apiUrl = 'http://localhost:3000/identificacionrequerimientos';

  constructor(private http: HttpClient) { }

  getProcedimiento(id: number): Observable<Procedimiento> {
    return this.http.get<Procedimiento>(`${this.apiUrl}/${id}`);
  }

  // Obtener todos los procedimientos
  getProcedimientos(): Observable<Procedimiento[]> {
    return this.http.get<Procedimiento[]>(this.apiUrl);
  }

  // Crear nuevo procedimiento
  crearProcedimiento(data: Procedimiento): Observable<Procedimiento> {
    return this.http.post<Procedimiento>(this.apiUrl, data);
  }

  // Actualizar procedimiento
  editarProcedimiento(id: number, data: Procedimiento): Observable<Procedimiento> {
    return this.http.put<Procedimiento>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar procedimiento
  eliminarProcedimiento(id: number): Observable<Procedimiento> {
    return this.http.delete<Procedimiento>(`${this.apiUrl}/${id}`);
  }

  // Buscar procedimiento
  buscarProcedimientos(termino: string) {
    return this.http.get<Procedimiento[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

  // Descargar reporte PDF
  descargarReporte(id: number): Observable<Blob> {
    return this.http.get(`http://localhost:3000/report/${id}`, { responseType: 'blob' });
  }

}
