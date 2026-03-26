import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { Estados_de_asignacion } from '../interfaces/estado-asignacion.interface';
import { DocumentoSoporteService } from '../../estandarizacion/services/documento-soporte.service';
import { SoporteComputacionalService } from '../../estandarizacion/services/soporte-computacional.service';
import { ReglamentoService } from '../../estandarizacion/services/reglamento.service';
import { ProcedimientoService } from './procedimiento.service';


@Injectable({
    providedIn: 'root'
})
export class EstadoAsignacionService {

    //Estado de asignacion para el procedimiento
    estadoinicial: Estados_de_asignacion = { estado: 'Inicial', unificacion_de_criterios: false, soporte_documental: false, soporte_computacional: false, reglamentacion: false };
    Estado_intermedio_1: Estados_de_asignacion = { estado: 'Intermedio 1', unificacion_de_criterios: true, soporte_documental: true, soporte_computacional: false, reglamentacion: false };
    Estado_intermedio_2: Estados_de_asignacion = { estado: 'Intermedio 2', unificacion_de_criterios: true, soporte_documental: false, soporte_computacional: true, reglamentacion: false };
    Estado_intermedio_3: Estados_de_asignacion = { estado: 'Intermedio 3', unificacion_de_criterios: false, soporte_documental: true, soporte_computacional: false, reglamentacion: true };
    estado_completo: Estados_de_asignacion = { estado: 'Completo', unificacion_de_criterios: true, soporte_documental: true, soporte_computacional: true, reglamentacion: true };

    //servicios e inyecciones de dependencias
    private documentoSoporteService = inject(DocumentoSoporteService);
    private soporteComputacionalService = inject(SoporteComputacionalService);
    private reglamentoService = inject(ReglamentoService);
    private procedimientoService = inject(ProcedimientoService);


    obtenerCompletitud(procedimientoId: number): Observable<Estados_de_asignacion> {
        return forkJoin({
            doc: this.documentoSoporteService.getPorProcedimiento(procedimientoId).pipe(catchError(() => of(null))),
            soporte: this.soporteComputacionalService.getSoporteComputacional(procedimientoId).pipe(catchError(() => of(null))),
            // No encontré un campo específico en el componente de reglamento, así que intentaré obtenerlo del servicio
            reg: this.reglamentoService.obtenerReglamento(procedimientoId).pipe(catchError(() => of(null)))
        }).pipe(
            map(({ doc, soporte, reg }) => {
                const unificacion = true; // Según el requerimiento, siempre es true por ser creado en ficha técnica.
                const documental = !!(doc && doc.documento_completado);
                const computacional = !!(soporte && soporte.computacional_completado);
                const reglamentacion = !!(reg && reg.reglamento_completado);

                let estadoCalculado = 'Inicial';

                if (unificacion && documental && computacional && reglamentacion) {
                    estadoCalculado = 'Completo';
                } else if (unificacion && documental && !computacional && !reglamentacion) {
                    estadoCalculado = 'Intermedio 1';
                } else if (unificacion && !documental && computacional && !reglamentacion) {
                    estadoCalculado = 'Intermedio 2';
                } else if (!unificacion && documental && !computacional && reglamentacion) {
                    // Nota: unificacion es true siempre, así que este caso podría no darse según la lógica de "siempre true"
                    estadoCalculado = 'Intermedio 3';
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
            })
        );
    }

    actualizarEstadoProcedimiento(procedimientoId: number, nuevoEstado: string): Observable<any> {
        return this.procedimientoService.getProcedimiento(procedimientoId).pipe(
            map(p => {
                if (p.estado !== nuevoEstado) {
                    return this.procedimientoService.editarProcedimiento(procedimientoId, { ...p, estado: nuevoEstado });
                }
                return of(null);
            })
        );
    }
}

