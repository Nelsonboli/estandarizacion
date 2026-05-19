import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Reglamento } from '../interfaces/reglamento.interface';

@Injectable({
  providedIn: 'root'
})
export class ReglamentoService {

  private baseReglamento = `${environment.apiUrl}/reglamento`;

  constructor(private http: HttpClient) { }

  crearReglamento(procedimientoId: number) {
    return this.http.post<any>(`${this.baseReglamento}/crear-por-procedimiento/${procedimientoId}`, {})
  }

  obtenerReglamento(procedimientoId: number): Observable<Reglamento> {
    return this.http.get<Reglamento>(`${this.baseReglamento}/obtener-por-procedimiento/${procedimientoId}`)
  }

  actualizarReglamento(id: number, data: Partial<Reglamento>): Observable<Reglamento> {
    return this.http.put<Reglamento>(`${this.baseReglamento}/${id}`, data);
  }

  EliminarReglamento(id: number): Observable<Reglamento> {
    return this.http.delete<Reglamento>(`${this.baseReglamento}/${id}`)
  }

  subirFormatoDAAC(id: number, file: File): Observable<File> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<File>(`${this.baseReglamento}/${id}/subir-formato-daac`, formData);
  }

  eliminarFormatoDAAC(id: number): Observable<Reglamento> {
    return this.http.delete<Reglamento>(`${this.baseReglamento}/${id}/eliminar-formato-daac`);
  }
  obtenerFormatoDAAC(id: number): Observable<Reglamento> {
    return this.http.get<Reglamento>(`${this.baseReglamento}/${id}/archivo-procedimiento`);
  }

  marcarDescargaFormatoDAAC(id: number, fileName: string): Observable<Reglamento> {
    return this.http.put<Reglamento>(`${this.baseReglamento}/${id}/marcar-descarga`, { fileName });
  }

}
