import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecoleccionInformacion } from '../interfaces/recoleccion-informacion.interface';

@Injectable({
  providedIn: 'root'
})
export class RecoleccionInformacionService {

  private baseApi = `${environment.apiUrl}/recoleccion-informacion`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<RecoleccionInformacion[]> {
    return this.http.get<RecoleccionInformacion[]>(this.baseApi);
  }

  getPorProcedimiento(procedimientoId: number): Observable<RecoleccionInformacion> {
    return this.http.get<RecoleccionInformacion>(`${this.baseApi}/obtener-por-procedimiento/${procedimientoId}`);
  }

  crear(procedimientoId: number): Observable<RecoleccionInformacion> {
    return this.http.post<RecoleccionInformacion>(`${this.baseApi}/${procedimientoId}`, {});
  }

  actualizar(id: number, data: Partial<RecoleccionInformacion>): Observable<any> {
    return this.http.put(`${this.baseApi}/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseApi}/${id}`);
  }
}
