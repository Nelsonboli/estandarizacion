import { Component, EventEmitter, Output } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';

@Component({
  selector: 'app-unificacion-criterios',
  imports: [FormreutilizableComponent],
  templateUrl: './unificacion-criterios.component.html',
  styleUrl: './unificacion-criterios.component.css'
})
export class UnificacionCriteriosComponent {
  @Output () unifiacionEnviado = new EventEmitter<boolean>();

  fichaTecnica = [" Ficha tecnica de procedimiento"]


  unificacionCriterios = [
    { key: 'Procedimiento', label: 'Procedimiento',tooltip: 'hola mundo' },
    { key: 'Categoria', label: 'Categoria', tooltip:'hola mundo'},
    { key: 'Rol', label: 'Rol',tooltip:'hola mundo' },
    { key: 'Estado', label: 'Estado', tooltip:'hola mundo' },
    { key: 'Actividades', label: 'Actividades', tooltip:'hola mundo' },
    { key: 'Referentes', label: 'Referentes', tooltip:'hola mundo' },
  ];

  onEnviar(data: any) {
    // Evento sin validar
    console.log('Formulario enviado:', data);
  }

  onCancelar() {
    // Evento sin validar
    console.log('Formulario cancelado');
  }

}

