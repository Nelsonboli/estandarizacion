import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosService } from '../../shared/servicios/datos.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { DiagramaService } from '../../shared/servicios/diagrama.service';
import { SoporteComputacionalService } from '../../shared/servicios/soporte-computacional.service';
import { ProcedimientoService } from '../../shared/servicios/modulos/procedimiento.service';
import { FormularioDAACService } from '../../shared/servicios/modulos/formulario-daac.service';



@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent],
  templateUrl: './socializacionprocedimientos.component.html',
  styleUrl: './socializacionprocedimientos.component.css'
})

export class SocializacionprocedimientosComponent implements OnInit {
  procedimientos: any[] = [];
  soportecomputacional?: true;
  abrir = false;
  procedimientoSeleccionado: any = null;
  filasProcedimiento: { Criterio: string; Descripcion: string }[] = [];
  objectKeys = Object.keys;
  imagenDiagrama: string | null = null;
  soporteComputacional: any = null;

  datosDAAC: { Criterio: string; Descripcion: string }[] = [];

  constructor(
    private formularioDAACService: FormularioDAACService,
    public datosTablaService: DatosService,
    public tablaService: TablaService,
    private listaService: EstadolistaService,
    private diagramaService: DiagramaService,
    private soporteService: SoporteComputacionalService,
    private procedimientoService: ProcedimientoService,
  ) { }

  ngOnInit() {
    this.imagenDiagrama = this.diagramaService.cargarImagen();

    this.soporteService.soporteComputacional$.subscribe(data => {
      if (data) {
        this.soporteComputacional = data
      }
    })

    this.procedimientoService.getProcedimientos().subscribe({
      next: (data) => {
        this.procedimientos = data;
        this.tablaService.setProcedimientos(data);
      },
      error: (err) => {
        console.error('Error al obtener los procedimientos:', err);
      }
    });

    this.listaService.visible$.subscribe(valor => {
      this.abrir = valor;
    });

    this.formularioDAACService.getFormularioDAAC().subscribe(formularios => {
      if (formularios && formularios.length > 0) {
        const ultimoformulario = formularios[formularios.length - 1]
        this.mapearDatosDAAC(ultimoformulario);
      }
    })
  }

  abrirListaSocializacion() {
    this.listaService.abrir(); // Se abre la lista al llegar a Socialización
  }

  cerrarModal() {
    this.abrir = false;
    this.listaService.cerrar();
  }

  fecha = '';
  lugar = '';
  socializado = false;

  registrarSocializacion() {
    if (this.fecha && this.lugar) {
      this.socializado = true;
    }
  }

  onSocializar(procedimiento: any) {
    this.procedimientoSeleccionado = procedimiento;
    
    // Transformar el objeto seleccionado en filas para la tabla
    this.filasProcedimiento = Object.keys(procedimiento).map(key => ({
      Criterio: key.toUpperCase(),
      Descripcion: Array.isArray(procedimiento[key])
        ? procedimiento[key].join(', ')
        : procedimiento[key]
    }));
    this.cerrarModal();
  }


    mapearDatosDAAC(formulario: any) {
    this.datosDAAC = this.datosTablaService.columnasDAAC.map(columna => {
      const valor = formulario[columna.key] || formulario[columna.label] || '';
      return {
        Criterio: columna.key,
        Descripcion: valor
      };
    });
  }


}

