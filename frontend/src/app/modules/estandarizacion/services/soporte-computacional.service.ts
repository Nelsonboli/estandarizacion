import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { SoporteComputacional } from '../interfaces/soporte-computacional.interface';

@Injectable({
  providedIn: 'root'
})
export class SoporteComputacionalService {

  private baseSoporteComputacional = `${environment.apiUrl}/soporte-computacional`;

  constructor(private http: HttpClient) { }

  crearSoporteComputacional(procedimientoId: number): Observable<SoporteComputacional> {
    return this.http.post<SoporteComputacional>(`${this.baseSoporteComputacional}/crear-por-procedimiento/${procedimientoId}`, {});
  }

  getSoporteComputacional(procedimientoId: number): Observable<SoporteComputacional> {
    return this.http.get<SoporteComputacional>(`${this.baseSoporteComputacional}/obtener-por-procedimiento/${procedimientoId}`);
  }

  actualizarSoporteComputacional(id: number, data: Partial<SoporteComputacional>): Observable<any> {
    return this.http.put(`${this.baseSoporteComputacional}/${id}`, data);
  }

  eliminarSoporteComputacional(id: number): Observable<any> {
    return this.http.delete(`${this.baseSoporteComputacional}/${id}`);
  }
}
