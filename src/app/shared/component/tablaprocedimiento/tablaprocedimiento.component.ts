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

  @Input() data: any[] = [];
  @Input() columns: { key: string; header: string }[] = [];
  @Input() accionesTemplate?: TemplateRef<any>;

  @Output() editar = new EventEmitter<any>();
  @Output() eliminar = new EventEmitter<any>();
  
}


