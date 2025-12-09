import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoporteComputacionalService {

  private apiUrl = 'http://localhost:3000/soporte-computacional';

  constructor(private http: HttpClient) { }

  crearSoporteComputacional(procedimientoId: number) {
    return this.http.post<any>(`${this.apiUrl}/crear-por-procedimiento/${procedimientoId}`, {});
  }
  getSoporteComputacional(procedimientoId: number) {
    return this.http.get<any>(`${this.apiUrl}/obtener-por-procedimiento/${procedimientoId}`);
  }

  actualizarSoporteComputacional(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarSoporteComputacional(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
