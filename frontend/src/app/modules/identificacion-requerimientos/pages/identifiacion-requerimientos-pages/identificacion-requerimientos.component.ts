import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map, Subject, debounceTime, distinctUntilChanged, takeUntil, catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TablaDatosComponent } from '../../../../shared/components/tabla-datos/tabla-datos.component';
import { NavegacionComponent } from '../../../../shared/components/navegacion/navegacion';
import { Procedimiento } from '../../interfaces/procedimiento.interface';
import { EstadoAsignacionService } from '../../services/estado-asignacion.service';
import { ProcedimientoService } from '../../services/procedimiento.service';
import { EstadolistaService } from '../../../../shared/services/estado-lista.service';
import { TablaProcedimientoService } from '../../services/tabla-procedimiento.service';
import { AlertService } from '../../../../shared/services/alert.service';
import { DatosService } from '../../../../shared/services/datos.service';
import { Estados_de_asignacion } from '../../interfaces/estado-asignacion.interface';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-identificacion-requerimientos',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent, NavegacionComponent, TablaDatosComponent, FormsModule],
  templateUrl: './identificacion-requerimientos.component.html',
  styleUrl: './identificacion-requerimientos.component.css'
})
export class IdentificacionrequerimientosComponent implements OnInit, OnDestroy {
  //Servicios e inyeccion de dependencias
  private procedimientoService = inject(ProcedimientoService);
  private tablaService = inject(TablaProcedimientoService);
  private listaService = inject(EstadolistaService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  public datosService = inject(DatosService);
  private estadoAsignacionService = inject(EstadoAsignacionService);

  mostrarModal = signal(false);
  datoEditar: Procedimiento | null = null;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  datosTablaProcedimiento = toSignal(this.tablaService.procedimientos$, { initialValue: [] as Procedimiento[] });

  ngOnInit(): void {
    this.cargarProcedimientos();
    this.setupSearchHandler();
    console.log("this is console of datosTablaProcedimiento:", this.datosTablaProcedimiento());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('overflow-hidden');
  }

  private setupSearchHandler(): void {
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(termino => {
      this.ejecutarBusqueda(termino);
    });
  }

  cargarProcedimientos(): void {
    this.procedimientoService.getProcedimientos().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Procedimiento[]) => {
        const requests = data.map(p =>
          this.estadoAsignacionService.obtenerCompletitud(p.id!).pipe(
            map((estadoInfo: Estados_de_asignacion) => ({ ...p, estado: estadoInfo.estado })),
            catchError(() => of({ ...p, estado: 'Error' }))
          )
        );
        forkJoin(requests).subscribe({
          next: (procedimientosActualizados: Procedimiento[]) => {
            this.tablaService.setProcedimientos(procedimientosActualizados);
          },
        });
      },
      error: () => {
        this.alertService.error('No se pudieron cargar los procedimientos');
      }
    });
  }

  abrirFormulario(): void {
    this.mostrarModal.set(true);
    this.datoEditar = null;
    document.body.classList.add('overflow-hidden');
  }

  cerrarFormulario(): void {
    this.mostrarModal.set(false);
    this.datoEditar = null;
    document.body.classList.remove('overflow-hidden');
  }

  guardarDatosFormulario(procedimiento: Procedimiento): void {
    const request = this.datoEditar
      ? this.procedimientoService.editarProcedimiento(procedimiento.id!, procedimiento)
      : this.procedimientoService.crearProcedimiento(procedimiento);
    request.subscribe({
      next: () => {
        this.alertService.exito(`Procedimiento ${this.datoEditar ? 'actualizado' : 'guardado'} correctamente`);
        this.cargarProcedimientos();
        this.cerrarFormulario();
      },
      error: () => {
        this.alertService.error('Hubo un error al procesar el procedimiento');
      }
    });
  }

  eliminarProcedimiento(procedimiento: Procedimiento): void {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.procedimientoService.eliminarProcedimiento(procedimiento.id!).subscribe({
          next: () => {
            const actuales = this.datosTablaProcedimiento();
            const actualizados = actuales.filter(p => p.id !== procedimiento.id);
            this.tablaService.setProcedimientos(actualizados);
            this.alertService.exito('Procedimiento eliminado');
          },
          error: () => {
            this.alertService.error('No se pudo eliminar el procedimiento');
          }
        });
      }
    });
  }

  editarProcedimiento(procedimiento: Procedimiento): void {
    this.datoEditar = procedimiento;
    this.mostrarModal.set(true);
    document.body.classList.add('overflow-hidden');
  }

  buscarProcedimientos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  private ejecutarBusqueda(termino: string): void {
    if (!termino.trim()) {
      this.cargarProcedimientos();
      return;
    }
    this.procedimientoService.buscarProcedimientos(termino).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data: Procedimiento[]) => {
        this.tablaService.setProcedimientos(data);
      },
      error: () => {
        this.alertService.error('Error al realizar la búsqueda');
      }
    });
  }

  verListaProcedimientos(): void {
    this.listaService.abrir();
    this.router.navigate(['/socializacionprocedimientos']);
  }


  descargarFormatoProcedimiento() {

  }
}




