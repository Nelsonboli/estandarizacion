import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormularioDAACService {

  private apiUrl = 'http://localhost:3000/formulariodaac';

  constructor(private http: HttpClient) {}

  getFormularioDAAC(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearFormularioDAAC(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarFormularioDAAC(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  eliminarFormularioDAAC(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  BuscarFormularioDAAC(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
