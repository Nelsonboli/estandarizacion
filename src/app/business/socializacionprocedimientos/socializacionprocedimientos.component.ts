import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { TablaService } from '../../shared/servicios/tabla.service';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';


@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,TablaCriteriosComponent, NavegacionComponent, ListaDesplegableComponent],
  templateUrl: './socializacionprocedimientos.component.html',
  styleUrl: './socializacionprocedimientos.component.css'
})
export class SocializacionprocedimientosComponent implements OnInit{
   procedimientos: any[] = [];

  constructor(public tablaestandarizacionService : TablaestandarizacionService,
              private tablaService: TablaService,
              private listaService: EstadolistaService
   ){}

  abrir = false;
  cerrarModal() {
    this.listaService.cerrar();
  }

   ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });

    this.listaService.visible$.subscribe(v => this.abrir = v);
  }

  columnas = [
    'Procedimiento',
    'Categoria',
    'Rol',
    'Estado',
    'Actividades',
    'Referentes'
  ];

  procedimiento:any = {
    titulo: 'Gestion de Horarios',
    aprobado: 'Si',
    objetivo : 'Gestionar los horarios académicos de la Facultad de Ingeniería',
    estadoInicial: 'Intermedio 2 "I2"',
    estadoActual: 'Completo "C"'
  };

  roles: any[] = [
    { nombre: 'secretaria academica', descripcion: 'Responsable' },
    { nombre: 'Decano', descripcion: 'Rol' },
    { nombre: 'Docentes', descripcion: 'Rol ' },
  ];

  nombres = this.roles.map(rol => rol.nombre);

  pasos: any[] = [
    { titulo: 'Reunir a los Roles Involucrados', responsable: this.nombres},
    { titulo: 'Socializar el procedimiento Estandarizado', responsable: 'A roles involucrados'},
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

  procedimientoSeleccionado: any = null;

onSocializar(procedimiento: any) {
  this.procedimientoSeleccionado = procedimiento;
  // Aquí puedes mostrar la información, abrir otro modal, etc.
  console.log('Procedimiento a socializar:', procedimiento);
}

}
