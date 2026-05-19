import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DiagramaFlujoService {
    private baseDiagramaDeFlujo = `${environment.apiUrl}/diagrama_flujo`;
    private imagen: string | null = null;

    constructor(private http: HttpClient) { }

    guardarImagen(img: string) {
        this.imagen = img;
    }

    cargarImagen() {
        return this.imagen;
    }

    guardarDiagramaCompleto(id: number, data: { pdf_diagrama: string, json_diagrama: any, documento_diagrama: string, imagenes: string[] }): Observable<any> {
        return this.http.post(`${this.baseDiagramaDeFlujo}/guardar-diagrama/${id}`, data);
    }

    getDiagramaPdf(id: number): Observable<{ pdfBase64: string, nombreArchivo: string }> {
        return this.http.get<{ pdfBase64: string, nombreArchivo: string }>(`${this.baseDiagramaDeFlujo}/get-diagrama-pdf/${id}`);
    }

    obtenerPorDocumento(documentoId: number): Observable<any> {
        return this.http.get<any>(`${this.baseDiagramaDeFlujo}/${documentoId}`);
    }

    eliminarDiagrama(id: number): Observable<any> {
        return this.http.delete(`${this.baseDiagramaDeFlujo}/eliminar-diagrama/${id}`);
    }
}
