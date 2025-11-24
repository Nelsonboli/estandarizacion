import { AlertService } from './../../shared/Utils/Alertas/alert.service';
import { DatosService } from './../../shared/servicios/datos.service';
import { Component, OnInit } from '@angular/core';
import { TablaService } from '../../shared/servicios/tabla.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ModalComponent } from '../../shared/component/modal/modal.component';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { Router } from '@angular/router';
import { ProcedimientoService } from '../../shared/servicios/modulos/procedimiento.service';
import { TablaDatosComponent } from "../../shared/component/tabla-datos/tabla-datos.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-identificacionrequerimientos',
  imports: [RouterLink, ModalComponent, NavegacionComponent, TablaDatosComponent, FormsModule,],
  templateUrl: './identificacionrequerimientos.component.html',
  styleUrl: './identificacionrequerimientos.component.css'
})

export class IdentificacionrequerimientosComponent implements OnInit {
  mostrarModal = false;
  procedimientos: any[] = [];
  datoEditar: any = null;
  terminoBusqueda: string = '';

  constructor(
    private procedimientoService: ProcedimientoService,
    private tablaService: TablaService,
    private listaService: EstadolistaService,
    private router: Router,
    private alertService: AlertService,
    public datosService: DatosService,
  ) { }

  ngOnInit() {
    this.procedimientoService.getProcedimientos().subscribe({
      next: (data) => {
        this.procedimientos = data;
        this.tablaService.setProcedimientos(data);
      },
      error: (err) => {
        console.error('Error al cargar procedimientos', err);
      }
    });
  }

  // Abrir Formulario modal
  abrirFormulario() {
    this.mostrarModal = true;
    this.datoEditar = null;
    document.body.classList.add('overflow-hidden');
  }

  // Cerrrar formulario modal
  cerrarFormulario() {
    this.mostrarModal = false;
    this.datoEditar = null;
    document.body.classList.remove('overflow-hidden');
  }

  // Metodo que guardar un procedimiento del formulario (Frontend y Backend) 
  guardarDatosFormulario(nuevoDato: any) {
    if (this.datoEditar) {
      this.procedimientoService.editarProcedimiento(nuevoDato.id, nuevoDato).subscribe({
        next: () => {
          this.procedimientoService.getProcedimientos().subscribe(data => {
            this.tablaService.setProcedimientos(data);
          });
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('error al actualizar el procedimiento', err);
          this.alertService.error('Error al actualizar el procedimiento');
        }
      });
    } else {
      this.procedimientoService.crearProcedimiento(nuevoDato).subscribe({
        next: () => {
          this.alertService.exito('Procedimiento guardado correctamente');
          this.procedimientoService.getProcedimientos().subscribe(data => {
            this.tablaService.setProcedimientos(data);
          });
          this.cerrarFormulario();
        },
        error: (err) => {
          console.error('Error al guardar procedimiento', err);
          this.alertService.error('Error al guardar el procedimiento');
        }
      });
    }
  }

  // Metodo que elimina un procedimiento(Frontend y Backend)  
  eliminarProcedimiento(dato: any) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.procedimientoService.eliminarProcedimiento(dato.id).subscribe({
          next: () => {
            this.procedimientos = this.procedimientos.filter(p => p !== dato);
            this.tablaService.setProcedimientos(this.procedimientos);
            this.alertService.exito('Procedimiento eliminado')
          },
          error: (err) => {
            console.error(err);
            this.alertService.error('No se pudo eliminar el procedimiento');
          }
        })
      }
    });
  }

  // Metodo que elimina un procedimiento(Frontend y Backend) 
  editarProcedimiento(dato: any) {
    this.datoEditar = dato;
    this.mostrarModal = true;
    document.body.classList.add('overflow-hidden');
  }

  // Buscar Procedimiento
  buscarProcedimientos() {
    this.procedimientoService.buscarProcedimientos(this.terminoBusqueda).subscribe({
      next: (data) => {
        this.procedimientos = data;
        this.tablaService.setProcedimientos(data); // actualiza la tabla
      },
      error: (err) => {
        console.error('Error al buscar procedimientos', err);
        this.alertService.error('Error al buscar procedimientos')
      }
    });
  }

  // lista de procedimientos
  ListaProcedimientos() {
    this.listaService.abrir();
    this.router.navigate(['/socializacionprocedimientos']);
  }
}


