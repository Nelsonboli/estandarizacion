import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DiagramaFlujoService {
    private base = 'http://localhost:3000/documento_soporte';
    private imagen: string | null = null;

    constructor(private http: HttpClient) { }

    guardarImagen(img: string) {
        this.imagen = img;
    }

    cargarImagen() {
        return this.imagen;
    }

    cargarImagenesDiagramaFlujo() {

    }


    guardarDiagramaCompleto(id: number, data: { pdf_diagrama: string, json_diagrama: any, id_diagrama: string, imagenes: string[] }): Observable<any> {
        return this.http.post(`${this.base}/guardar-diagrama/${id}`, data);
    }

    getDiagramaPdf(id: number): Observable<{ pdfBase64: string, nombreArchivo: string }> {
        return this.http.get<{ pdfBase64: string, nombreArchivo: string }>(`${this.base}/get-diagrama-pdf/${id}`);
    }

    obtenerPorDocumento(documentoId: number): Observable<any> {
        return this.http.get<any>(`${this.base}/${documentoId}`);
    }

    eliminarDiagrama(id: number): Observable<any> {
        return this.http.delete(`${this.base}/eliminar-diagrama/${id}`);
    }
}
