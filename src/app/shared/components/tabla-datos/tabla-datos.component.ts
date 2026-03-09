import { Component, TemplateRef, input, model } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormatearArrayPipe } from '../../pipes/formatear-array.pipe';
import { Campos } from '../../interfaces/campos.interface';


@Component({
  selector: 'app-tabla-datos',
  imports: [CommonModule, FormatearArrayPipe, TitleCasePipe],
  templateUrl: './tabla-datos.component.html',
  styleUrl: './tabla-datos.component.css'
})
export class TablaDatosComponent {

  encabezadoGeneral = input<string>();
  columnas = input<Campos[]>([]);
  data = model<any[]>([]);
  accionesTemplate = input<TemplateRef<any>>();
  mostrarOpciones = input<boolean>(true);

}







