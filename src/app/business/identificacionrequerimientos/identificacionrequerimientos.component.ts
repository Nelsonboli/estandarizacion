import { Component, OnInit } from '@angular/core';
import { TablaprocedimientoComponent } from '../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { TablaService } from '../../shared/servicios/tabla.service';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/component/modal/modal.component';
import { BotonCambiarComponent } from '../../shared/component/boton-cambiar/boton-cambiar.component';


@Component({
  selector: 'app-identificacionrequerimientos',
  imports: [TablaprocedimientoComponent, RouterLink, ModalComponent, BotonCambiarComponent],
  templateUrl: './identificacionrequerimientos.component.html',
  styleUrl: './identificacionrequerimientos.component.css'
})
export class IdentificacionrequerimientosComponent implements OnInit {
 constructor(private tablaService: TablaService,
 
 ) {}
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

   abrirFormulario() {
    this.mostrarModal = true;
    document.body.classList.add('overflow-hidden');
  }

  cerrarFormulario() {
    this.mostrarModal = false;
    document.body.classList.remove('overflow-hidden');
  }

  guardarDatos(procedimiento: any) {
    this.tablaService.agregarProcedimiento(procedimiento);
    this.cerrarFormulario();
  } 

    eliminar(item: any) {
    this.procedimientos = this.procedimientos.filter(p => p !== item);
    this.tablaService.setProcedimientos(this.procedimientos);
  }

}
