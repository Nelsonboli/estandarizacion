import { Component, EventEmitter,Input, Output, TemplateRef } from '@angular/core';
import { TablaService } from '../../servicios/tabla.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'app-tablaprocedimiento',
  standalone: true,
  imports: [HttpClientModule,CommonModule],
  templateUrl: './tablaprocedimiento.component.html',
  styleUrl: './tablaprocedimiento.component.css',
  providers:[
    TablaService
  ]
})
export class TablaprocedimientoComponent  {

@Input() encabezadoGeneral?: string;
@Input() columns: { key: string, header: string }[] = [];
@Input() data: any[] = [];
@Input() accionesTemplate?: TemplateRef<any>;

@Output() eliminar = new EventEmitter<any>();
@Output() editar = new EventEmitter<any>();
  
}


