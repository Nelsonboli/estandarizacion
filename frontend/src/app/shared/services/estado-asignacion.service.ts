import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, map, of, catchError, switchMap } from 'rxjs';
import { DocumentoSoporteService } from '../../modules/estandarizacion/services/documento-soporte.service';
import { SoporteComputacionalService } from '../../modules/estandarizacion/services/soporte-computacional.service';
import { ReglamentoService } from '../../modules/estandarizacion/services/reglamento.service';
import { ProcedimientoService } from '../../modules/identificacion-requerimientos/services/procedimiento.service';
import { HttpClient } from '@angular/common/http';
import { AsignacionEstado } from '../interfaces/asignacion-estado.interface';
import { CriteriosEstado } from '../interfaces/criterios-estado';


@Injectable({
    providedIn: 'root'
})
export class EstadoAsignacionService {

    private baseAsignacionEstado = 'http://localhost:3000/asignacion_estado';

    constructor(private http: HttpClient) { }

    crearAsignacionEstado(procedimientoId: number) {
        return this.http.post<any>(`${this.baseAsignacionEstado}/crear/${procedimientoId}`, {})
    }

    obtenerAsignacionEstado(procedimientoId: number): Observable<AsignacionEstado> {
        return this.http.get<AsignacionEstado>(`${this.baseAsignacionEstado}/obtener-por-procedimiento/${procedimientoId}`)
    }

    actualizarAsignacionEstado(id: number, data: Partial<AsignacionEstado>): Observable<AsignacionEstado> {
        return this.http.put<AsignacionEstado>(`${this.baseAsignacionEstado}/${id}`, data);
    }

    EliminarAsignacionEstado(id: number) {
        return this.http.delete<any>(`${this.baseAsignacionEstado}/${id}`)
    }


    //Estado de asignacion para el procedimiento
    estadoinicial: CriteriosEstado = { estado: 'Inicial', unificacion_de_criterios: false, soporte_documental: false, soporte_computacional: false, reglamentacion: false };
    Estado_intermedio_1: CriteriosEstado = { estado: 'Intermedio 1', unificacion_de_criterios: true, soporte_documental: true, soporte_computacional: false, reglamentacion: false };
    Estado_intermedio_2: CriteriosEstado = { estado: 'Intermedio 2', unificacion_de_criterios: true, soporte_documental: false, soporte_computacional: true, reglamentacion: false };
    Estado_intermedio_3: CriteriosEstado = { estado: 'Intermedio 3', unificacion_de_criterios: false, soporte_documental: true, soporte_computacional: false, reglamentacion: true };
    estado_completo: CriteriosEstado = { estado: 'Completo', unificacion_de_criterios: true, soporte_documental: true, soporte_computacional: true, reglamentacion: true };

    //servicios e inyecciones de dependencias
    private documentoSoporteService = inject(DocumentoSoporteService);
    private soporteComputacionalService = inject(SoporteComputacionalService);
    private reglamentoService = inject(ReglamentoService);
    private procedimientoService = inject(ProcedimientoService);


    obtenerCompletitud(procedimientoId: number): Observable<CriteriosEstado> {
        return forkJoin({
            doc: this.documentoSoporteService.getPorProcedimiento(procedimientoId).pipe(catchError(() => of(null))),
            soporte: this.soporteComputacionalService.getSoporteComputacional(procedimientoId).pipe(catchError(() => of(null))),
            reg: this.reglamentoService.obtenerReglamento(procedimientoId).pipe(catchError(() => of(null)))
        }).pipe(
            map(({ doc, soporte, reg }) => {
                const criterios = [
                    !!(doc && doc.documento_completado),
                    !!(soporte && soporte.computacional_completado),
                    !!(reg && reg.reglamento_completado)
                ];
                return this.calcularEstado(criterios);
            })
        );
    }

    private calcularEstado(criterios: boolean[]): CriteriosEstado {
        const [documental, computacional, reglamentacion] = criterios;
        const unificacion = true;

        let estadoCalculado = 'Inicial';

        if (unificacion && documental && computacional && reglamentacion) {
            estadoCalculado = 'Completo';
        } else if (unificacion && documental && !computacional && !reglamentacion) {
            estadoCalculado = 'Intermedio 1';
        } else if (unificacion && !documental && computacional && !reglamentacion) {
            estadoCalculado = 'Intermedio 2';
        } else if (documental && reglamentacion) {
            estadoCalculado = 'Intermedio 3';
        }

        return {
            estado: estadoCalculado,
            unificacion_de_criterios: unificacion,
            soporte_documental: documental,
            soporte_computacional: computacional,
            reglamentacion: reglamentacion
        };
    }

    actualizarEstadoProcedimiento(procedimientoId: number, criterios: boolean[]): Observable<any> {
        const infoEstado = this.calcularEstado(criterios);
        const criteriosCompletos = criterios.every(c => c === true);

        return this.obtenerAsignacionEstado(procedimientoId).pipe(
            switchMap(asignacion => {
                const data: Partial<AsignacionEstado> = {
                    estado_procedimiento: infoEstado.estado,
                    criterios_completos: criteriosCompletos
                };
                return this.actualizarAsignacionEstado(asignacion.id, data);
            }),
            catchError(err => {
                console.error('Error al actualizar estado asignación:', err);
                return this.crearAsignacionEstado(procedimientoId).pipe(
                    switchMap(nuevaAsignacion => {
                        const data: Partial<AsignacionEstado> = {
                            estado_procedimiento: infoEstado.estado,
                            criterios_completos: criteriosCompletos
                        };
                        return this.actualizarAsignacionEstado(nuevaAsignacion.id, data);
                    })
                );
            })
        );
    }
}

