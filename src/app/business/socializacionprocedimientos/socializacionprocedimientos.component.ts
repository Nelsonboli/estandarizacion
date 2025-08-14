import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';


@Component({
  selector: 'app-socializacionprocedimientos',
  imports: [ReactiveFormsModule, CommonModule, FormsModule,TablaCriteriosComponent],
  templateUrl: './socializacionprocedimientos.component.html',
  styleUrl: './socializacionprocedimientos.component.css'
})
export class SocializacionprocedimientosComponent {

  constructor(public tablaestandarizacionService : TablaestandarizacionService ){}

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

}
