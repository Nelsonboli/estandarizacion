import { Component } from '@angular/core';
import { CardComponent } from '../../shared/component/card/card.component';
import { CommonModule } from '@angular/common';
import { SoporteComputacionalComponent } from '../Estados/soporte-computacional/soporte-computacional.component';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { ReglamentoComponent } from '../Estados/reglamento/reglamento.component';
import { InicioComponent } from '../Estados/inicio/inicio.component';
import { UnificacionCriteriosComponent } from "../Estados/unificacion-criterios/unificacion-criterios.component";
import { DocumentacionSoporteComponent } from "../Estados/documentacion-soporte/documentacion-soporte.component";

@Component({
  standalone: true,
  selector: 'app-estandarizar',
  imports: [CardComponent, SoporteComputacionalComponent, CommonModule,
     FormsModule, ReactiveFormsModule, ReglamentoComponent, InicioComponent, UnificacionCriteriosComponent, DocumentacionSoporteComponent], 
  templateUrl: './estandarizar.component.html',
  styleUrl: './estandarizar.component.css',
  template: `<app-card/>`,
})

export class EstandarizarComponent {
  hoverIndex: number | null = null;
  buttonIndex: number | null = null;
  estadoCompletos: boolean[] = [];
  estados = [" Unificación de Criterios", "Documento de Soporte", "Soporte Computacional", "Reglamento"];
  
  // getColorHover(i: number): string {
  //   switch (i) {
  //     case 0: return 'group-hover:bg-rojo-btn hover:text-white';
  //     case 1: return 'group-hover:bg-amarillo-btn hover:text-white';
  //     case 2: return 'group-hover:bg-azul-btn hover:text-white';
  //     case 3: return 'group-hover:bg-verde-btn hover:text-white';
  //     default: return '';
  //   }
  // }

  onButtonClick(index: number) {
    //  this.buttonIndex = this.buttonIndex === index ? null : index;
    this.buttonIndex = index;
    this.hoverIndex = null; // Oculta la card flotante al hacer clic
  }

onEstadoCompleto(event: { index: number; completo: boolean }) {
  this.estadoCompletos[event.index] = event.completo;
}
}
