import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReglamentoService {

  private apiUrl = 'http://localhost:3000/reglamento';

  constructor(private http: HttpClient) { }

  crearReglamento(procedimientoId: number) {
    return this.http.post<any>(`${this.apiUrl}/crear-por-procedimiento/${procedimientoId}`, {})
  }

  obtenerReglamento(procedimientoId: number) {
    return this.http.get<any>(`${this.apiUrl}/obtener-por-procedimiento/${procedimientoId}`)
  }

  actualizarReglamento(id: number, reglamento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, reglamento);
  }

  EliminarReglamento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

}
