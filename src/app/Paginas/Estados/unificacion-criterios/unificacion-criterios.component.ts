import { Component } from '@angular/core';
import { FormreutilizableComponent } from '../../../shared/component/formreutilizable/formreutilizable.component';

@Component({
  selector: 'app-unificacion-criterios',
  imports: [FormreutilizableComponent],
  templateUrl: './unificacion-criterios.component.html',
  styleUrl: './unificacion-criterios.component.css'
})
export class UnificacionCriteriosComponent {
  fichaTecnica = " Ficha tecnica de procedimiento"


  unificacionCriterios = [
    { key: 'Procedimiento', label: 'Procedimiento', },
    { key: 'Categoria', label: 'Categoria', },
    { key: 'Rol', label: 'Rol' },
    { key: 'Estado', label: 'Estado' },
    { key: 'Actividades', label: 'Actividades' },
    { key: 'Referentes', label: 'Referentes' },
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

