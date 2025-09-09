import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { TablaEstadosComponent } from "../../shared/component/tablaEstados/tabla-estados.component";

@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NavegacionComponent, ListaDesplegableComponent, TablaCriteriosComponent, TablaEstadosComponent],
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

  constructor(public tablaestandarizacionService: TablaestandarizacionService,
    private tablaService: TablaService,
    private listaService: EstadolistaService
  ) { }

  ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });

      this.listaService.visible$.subscribe(valor => {
    this.abrir = valor;
  });
  }

  abrirListaSocializacion() {
  this.listaService.abrir(); // Se abre la lista al llegar a Socialización
}

  cerrarModal() {
    this.abrir = false;
    this.listaService.cerrar();
  }

  pasos: any[] = [
    { titulo: 'Reunir a los Roles Involucrados', responsable: "" },
    { titulo: 'Socializar el procedimiento Estandarizado', responsable: 'A roles involucrados' },
    { titulo: 'Generar informe de socializacion', responsable: 'Consejo de Facultad' }
  ];

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
}
