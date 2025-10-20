import { DocumentoBaseService } from './../../shared/servicios/documento-base.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatosTablaService } from '../../shared/servicios/datosTablas.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { FormularioDAACService } from '../../shared/servicios/formulario-daac.service';
import { TablaprocedimientoComponent } from "../../shared/component/tablaprocedimiento/tablaprocedimiento.component";
import { DiagramaService } from '../../shared/servicios/diagrama.service';
import { SoporteComputacionalService } from '../../shared/servicios/soporte-computacional.service';


@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent, TablaprocedimientoComponent],
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
    public datosTablaService: DatosTablaService,
    public tablaService: TablaService,
    private listaService: EstadolistaService,
    private formularioDAACService: FormularioDAACService,
    public documentoBaseService: DocumentoBaseService,
    private diagramaService: DiagramaService,
    private soporteService: SoporteComputacionalService,
  ) { }

  ngOnInit() {
    this.imagenDiagrama = this.diagramaService.cargarImagen();

    this.soporteService.soporteComputacional$.subscribe(data=>{
      if(data){
        this.soporteComputacional=data
      }
    })

    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });

    this.listaService.visible$.subscribe(valor => {
      this.abrir = valor;
    });

    this.formularioDAACService.formularioDAAC$.subscribe(formularios => {
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
    this.datosDAAC = this.datosTablaService.columnas.map(columna => {
      const valor = formulario[columna.Criterio] || formulario[columna.Descripcion] || '';
      return {
        Criterio: columna.Criterio,
        Descripcion: valor
      };
    });
  }




}
