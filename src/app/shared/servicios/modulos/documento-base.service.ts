import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentoBaseService {
  private apiUrl = 'http://localhost:3000/documento_soporte';

  constructor(private http: HttpClient) {}

  getDocumentos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDocumento(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearDocumento(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarDocumento(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  eliminarDocumento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
