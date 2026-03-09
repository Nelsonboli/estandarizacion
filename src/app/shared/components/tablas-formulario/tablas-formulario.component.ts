import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, TemplateRef, effect, input } from '@angular/core';
import { Campos } from '../../interfaces/campos.interface';

@Component({
  selector: 'app-tablas-formulario',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './tablas-formulario.component.html',
  styleUrl: './tablas-formulario.component.css'
})
export class TablasFormularioComponent {
  encabezadoGeneral = input<string>();
  columnas = input<Campos[]>([]);
  data = input<any[]>([]);
  accionesTemplate = input<TemplateRef<any>>();
  mostrarOpciones = input<boolean>(true);
}
