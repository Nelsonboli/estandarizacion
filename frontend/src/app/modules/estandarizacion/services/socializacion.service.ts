import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { socializacion } from "../interfaces/socializacion.interface";
import { AlertService } from "../../../shared/services/alert.service";

@Injectable({
    providedIn: 'root'
})
export class SocializacionService {
    private baseSocializacion = 'http://localhost:3000/socializacion';

    private http = inject(HttpClient);
    private alertService = inject(AlertService);

    guardarSocializacion(data: socializacion): Observable<any> {
        return this.http.post(`${this.baseSocializacion}`, data);
    }

    eliminarSocializacion(id: number): Observable<any> {
        return this.http.delete(`${this.baseSocializacion}/${id}`);
    }

    actualizarSocializacion(id: number, data: Partial<socializacion>): Observable<any> {
        return this.http.patch(`${this.baseSocializacion}/${id}`, data);
    }

    obtenerSocializacion(id: number): Observable<socializacion> {
        return this.http.get<socializacion>(`${this.baseSocializacion}/${id}`);
    }

    obtenerPorProcedimiento(procedimientoId: number): Observable<socializacion> {
        return this.http.get<socializacion>(`${this.baseSocializacion}/procedimiento/${procedimientoId}`);
    }

    descargarPdfSocializacion(procedimientoId: number): Observable<Blob> {
        return this.http.get(`${this.baseSocializacion}/unir-pdfs/${procedimientoId}`, {
            responseType: 'blob'
        });
    }

    descargarDocumentoCompletado(procedimientoId: number, nombreProcedimiento: string): void {
        this.alertService.infoInformacion('Preparando descarga del procedimiento completado...');
        this.descargarPdfSocializacion(procedimientoId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `procedimiento_${nombreProcedimiento}_completado.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.alertService.infoExito('Descarga iniciada');
            },
            error: (err) => {
                console.error('Error al descargar el PDF:', err);
                this.alertService.error('Error al generar o descargar el PDF. Verifique que el formato DAAC firmado exista y que los datos de estandarizacion esten completos.');
            }
        });
    }
}
