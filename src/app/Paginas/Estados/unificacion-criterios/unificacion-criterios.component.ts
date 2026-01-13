import { Component, EventEmitter, Output } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';

@Component({
  selector: 'app-unificacion-criterios',
  imports: [FormreutilizableComponent],
  templateUrl: './unificacion-criterios.component.html',
  styleUrl: './unificacion-criterios.component.css'
})
export class UnificacionCriteriosComponent {
  @Output() unifiacionEnviado = new EventEmitter<boolean>();

  fichaTecnica = [" Ficha tecnica de procedimiento"]


  unificacionCriterios = [
    { key: 'Procedimiento', label: 'Procedimiento', tooltip: 'hola mundo' },
    {
      key: 'Categoria',
      label: 'Categoria',
      tooltip: 'hola mundo',
      type: 'select' as const,
      options: [
        { label: 'Procesos Misionales - Formacion Academica', value: 'Procesos Misionales - Formacion Academica' },
        { label: 'Procesos Misionales - Formacion Continua', value: 'Procesos Misionales - Formacion Continua' }
      ]
    },
    { key: 'Rol', label: 'Rol', tooltip: 'hola mundo' },
    {
      key: 'Estado',
      label: 'Estado',
      tooltip: 'hola mundo',
      type: 'select' as const,
      options: [
        { label: 'Inicial (I)', value: 'I' },
        { label: 'Intermedio 1 (I1)', value: 'I1' },
        { label: 'Intermedio 2 (I2)', value: 'I2' },
        { label: 'Intermedio 3 (I3)', value: 'I3' },
        { label: 'Completo (C)', value: 'C' }
      ]
    },
    { key: 'Actividades', label: 'Actividades', tooltip: 'hola mundo' },
    { key: 'Referentes', label: 'Referentes', tooltip: 'hola mundo' },
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

