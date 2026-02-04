import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcedimientoService {
  private apiUrl = 'http://localhost:3000/identificacionrequerimientos';

  constructor(private http: HttpClient) { }

  getProcedimiento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Obtener todos los procedimientos
  getProcedimientos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Crear nuevo procedimiento
  crearProcedimiento(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Actualizar procedimiento
  editarProcedimiento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar procedimiento
  eliminarProcedimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Buscar procedimiento
  buscarProcedimientos(termino: string) {
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, {
      params: { termino }
    });
  }

}
