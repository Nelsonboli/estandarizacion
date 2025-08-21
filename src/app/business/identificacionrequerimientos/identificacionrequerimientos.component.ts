import { Component, OnInit } from '@angular/core';
import { TablaprocedimientoComponent } from '../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { TablaService } from '../../shared/servicios/tabla.service';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/component/modal/modal.component';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';


@Component({
  selector: 'app-identificacionrequerimientos',
  imports: [TablaprocedimientoComponent, RouterLink, ModalComponent, NavegacionComponent],
  templateUrl: './identificacionrequerimientos.component.html',
  styleUrl: './identificacionrequerimientos.component.css'
})
export class IdentificacionrequerimientosComponent implements OnInit {
  mostrarModal = false;
  procedimientos: any[] = [];
  constructor(private tablaService: TablaService,) { }

  columnas = [
    { key: 'Procedimiento', header: 'Procedimiento' },
    { key: 'Categoria', header: 'Categoría' },
    { key: 'Rol', header: 'Rol' },
    { key: 'Estado', header: 'Estado' },
    { key: 'Actividades', header: 'Actividades' },
    { key: 'Referentes', header: 'Referentes' },
  ];

  ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      console.log('Procedimientos recibidos en identificación:', data);
      this.procedimientos = data;
    });
  }

  editar(dato: any) {
    console.log('Editar', dato);
  }

  estandarizar(dato: any) {
    console.log('Estandarizar', dato);
  }

  // abrir Formulario modal
  abrirFormulario() {
    this.mostrarModal = true;
    document.body.classList.add('overflow-hidden');
  }

  // eliminar formulario modal
  cerrarFormulario() {
    this.mostrarModal = false;
    document.body.classList.remove('overflow-hidden');
  }

  eliminar(item: any) {
    this.procedimientos = this.procedimientos.filter(p => p !== item);
    this.tablaService.setProcedimientos(this.procedimientos);
  }

  guardarDatos(nuevoDato: any) {
    this.procedimientos.push({
      id: this.procedimientos.length + 1,
      ...nuevoDato 
    });

    this.tablaService.setProcedimientos(this.procedimientos); 
  }

}
