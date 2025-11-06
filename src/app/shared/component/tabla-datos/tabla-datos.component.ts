import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { TablaService } from '../../servicios/tabla.service';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormatearArrayPipe } from '../../pipes/formatear-array.pipe';
import { TablaFormularioDAACService } from '../../servicios/tabla-formularioDAAC.service';

@Component({
  selector: 'app-tabla-datos',
  imports: [CommonModule,FormatearArrayPipe, TitleCasePipe],
  templateUrl: './tabla-datos.component.html',
  styleUrl: './tabla-datos.component.css'
})
export class TablaDatosComponent {

  @Input() encabezadoGeneral?: string;
  @Input() columns: { key: string, label: string }[] = [];
  @Input() data: any[] = [];
  @Input() accionesTemplate?: TemplateRef<any>;
  @Input() mostrarOpciones: boolean = true;



  constructor(private tablaService: TablaService,
    private tablaFormularioDAACService: TablaFormularioDAACService,
  ){}

  ngOnInit() {

    this.tablaService.procedimientos$.subscribe({
      next: (procedimientos) => {
        this.data = procedimientos;
        console.log('Tabla procedimiento actualizada :', this.data);
      }, 
      error: (err) => console.error('Error al obtener procedimientos', err)
    });

     this.tablaFormularioDAACService.FormularioDAAC$.subscribe({
      next: (formularioDAAC) => {
        this.data = formularioDAAC;
        console.log('Tabla de formulario actualizada:', this.data);
      },
      error: (err) => console.error('Error al obtener el formulario', err)
    });
  }

  }

 

