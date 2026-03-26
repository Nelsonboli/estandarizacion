import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { socializacion } from "../interfaces/socializacion.interface";

@Injectable({
    providedIn: 'root'
})
export class SocializacionService {
    private baseSocializacion = 'http://localhost:3000/socializacion';

    constructor(private http: HttpClient) { }

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
} 