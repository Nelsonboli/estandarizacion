import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tablas-formulario',
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './tablas-formulario.component.html',
  styleUrl: './tablas-formulario.component.css'
})
export class TablasFormularioComponent {


@Input() encabezadoGeneral?: string;
@Input() columns: { key: string, label: string }[] = [];
@Input() data: any[] = [];
@Input() accionesTemplate?: TemplateRef<any>;

@Input() mostrarOpciones: boolean = true;

@Output() eliminar = new EventEmitter<any>();
@Output() editar = new EventEmitter<any>();
Array: any;


ngOnChanges() {

  console.log('Datos recibidos en tabla:', this.data);
}

}
