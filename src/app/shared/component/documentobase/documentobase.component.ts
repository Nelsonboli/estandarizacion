import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-documentobase',
  imports: [CommonModule],
  templateUrl: './documentobase.component.html',
  styleUrl: './documentobase.component.css'
})
export class DocumentobaseComponent {

  @Input() encabezadoGeneral?: string;
@Input() columns: { key: string, label: string }[] = [];
@Input() data: any[] = [];
@Input() accionesTemplate?: TemplateRef<any>;

@Input() mostrarOpciones: boolean = true;

@Output() eliminar = new EventEmitter<any>();
@Output() editar = new EventEmitter<any>();
Array: any;

}
