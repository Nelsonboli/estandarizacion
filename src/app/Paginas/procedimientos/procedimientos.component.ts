import { Component, EventEmitter, inject, Input, OnInit} from '@angular/core';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { TablaService } from '../../shared/servicios/tabla.service';
import { TablaprocedimientoComponent } from '../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { ModalComponent } from '../../shared/component/modal/modal.component';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';

@Component({
  selector: 'app-procedimientos',
  imports: [TablaprocedimientoComponent, ModalComponent, ModalComponent, TablaCriteriosComponent],
  templateUrl: './procedimientos.component.html',
  styleUrl: './procedimientos.component.css',
  providers:[
    TablaService
  ]
})
export class ProcedimientosComponent implements OnInit {
mostrarModal = false;
procedimientos: any[] = [];


  columnas = [
    { key: 'Procedimiento', header: 'Procedimiento' },
    { key: 'Categoria', header: 'Categoría' },
    { key: 'Rol', header: 'Rol' },
    { key: 'Estado', header: 'Estado' },
    { key: 'Actividades', header: 'Actividades' },
    { key: 'Referentes', header: 'Referentes' },
  ];

  //  columnas = [
  //   { key: 'nombre', header: 'Nombre' },
  //   { key: 'descripcion', header: 'Descripción' }
  // ];

  constructor(
    public tablaestandarizacionService: TablaestandarizacionService,
    private tablaService: TablaService) {}

ngOnInit() {
  this.tablaService.procedimientos$.subscribe(data => {
    console.log('Procedimientos recibidos en identificación:', data);
    this.procedimientos = data;
  });
}

  //Formulario
  abrirFormulario() {
    this.mostrarModal = true;
    document.body.classList.add('overflow-hidden');
  }

  cerrarFormulario() {
    this.mostrarModal = false;
    document.body.classList.remove('overflow-hidden');
  }
  
  guardarDatos(procedimiento: any) {
    this.procedimientos.push(procedimiento);
    this.cerrarFormulario();
  }

    editarRegistro(p: any) {

    }

  eliminar(item: any) {
    this.procedimientos = this.procedimientos.filter(p => p !== item);
    this.tablaService.setProcedimientos(this.procedimientos);
  }
}

