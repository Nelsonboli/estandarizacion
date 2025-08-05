import { Component, Input, signal } from '@angular/core';
import { CardComponent } from '../../shared/component/card/card.component';
import { CommonModule } from '@angular/common';
import { SoporteComputacionalComponent } from '../../shared/component/soporte-computacional/soporte-computacional.component';
import { TablaprocedimientoComponent } from "../../shared/component/tablaprocedimiento/tablaprocedimiento.component";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormreutilizableComponent } from '../../shared/component/formreutilizable/formreutilizable.component';
import { ReglamentoComponent } from '../../shared/component/reglamento/reglamento.component';

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [CardComponent, SoporteComputacionalComponent, TablaprocedimientoComponent, CommonModule,
  FormreutilizableComponent, FormsModule, ReactiveFormsModule, ReglamentoComponent], 
  templateUrl: './estandarizar.component.html',
  styleUrl: './estandarizar.component.css',
  template: `<app-card/>`,
})

export class EstandarizarComponent {
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  fichaTecnica = " Ficha tecnica de procedimiento"
  formularioDAAC = " Formulario DAAC"
  formularioUnificacionCriterios = "Formulario Unificacion de Criterios"
  nuevoDato: string = '';
  listaDatos: any[] = [];
  estadoCompletos: boolean[] = [];
  estados = [" Unificación de Criterios", "Documento de Soporte", "Soporte Computacional", "Reglamento"];
  
  columnaDocumento = [
    { key: 'Documento', header: 'Documento' }
  ]

  unificacionCriterios = [
    { key: 'Procedimiento', label: 'Procedimiento', },
    { key: 'Categoria', label: 'Categoria', },
    { key: 'Rol', label: 'Rol' },
    { key: 'Estado', label: 'Estado' },
    { key: 'Actividades', label: 'Actividades' },
    { key: 'Referentes', label: 'Referentes' },
  ];

  procedimientos = [
    { key: 'Objetivo', label: 'Objetivo' },
    { key: 'Alcance', label: 'Alcance' },
    { key: 'Responsable', label: 'Responsable' },
    { key: 'Proveedor', label: 'Estado' },
    { key: 'Insumos', label: 'Insumos' },
    { key: 'Resultados', label: 'Resultado' },
    { key: 'Requisitos legales', label: 'Requisitos legales' },
    { key: 'Documentos', label: 'Documentos a realizar' },
    { key: 'Registros', label: 'Registros a realizar' },
  ];

  getColorHover(i: number): string {
    switch (i) {
      case 0: return 'group-hover:bg-rojo-btn hover:text-white';
      case 1: return 'group-hover:bg-amarillo-btn hover:text-white';
      case 2: return 'group-hover:bg-azul-btn hover:text-white';
      case 3: return 'group-hover:bg-verde-btn hover:text-white';
      default: return '';
    }
  }

  onButtonClick(index: number) {
    //  this.buttonIndex = this.buttonIndex === index ? null : index;
    this.buttonIndex = index;
    this.hoverIndex = null; // Oculta la card flotante al hacer clic
  }

  onEnviar(data: any) {
    console.log('Formulario enviado:', data);
  }

  onCancelar() {
    console.log('Formulario cancelado');
  }

  eliminar(dato: any) {
    console.log('Eliminar', dato);
  }

  agregarDato() {
    if (this.nuevoDato.trim()) {
      const nuevo = { Documento: this.nuevoDato.trim() };
      this.listaDatos.push(nuevo);
      this.nuevoDato = ''
    }
  }

  eliminarDato(item: any) {
    this.listaDatos = this.listaDatos.filter(p => p !== item);
  }

onEstadoCompleto(event: { index: number; completo: boolean }) {
  this.estadoCompletos[event.index] = event.completo;
}

  onSubmit() {
    // Procesar formulario aquí
  }
}
