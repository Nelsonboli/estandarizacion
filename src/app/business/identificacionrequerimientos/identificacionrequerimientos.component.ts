import { Procedimiento } from './../../shared/Models/socializacion';
import { Component, OnInit } from '@angular/core';
import { TablaprocedimientoComponent } from '../../shared/component/tablaprocedimiento/tablaprocedimiento.component';
import { TablaService } from '../../shared/servicios/tabla.service';
import { RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/component/modal/modal.component';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { Router } from '@angular/router';
import { AlertService } from '../../shared/servicios/alert.service';
import { TablaCriteriosComponent } from "../../shared/component/tablaCriterios/tablaCriterios.component";
import { TablaEstadosComponent } from "../../shared/component/tablaEstados/tabla-estados.component";

@Component({
  selector: 'app-identificacionrequerimientos',
  imports: [TablaprocedimientoComponent, RouterLink, ModalComponent, NavegacionComponent],
  templateUrl: './identificacionrequerimientos.component.html',
  styleUrl: './identificacionrequerimientos.component.css'
})
export class IdentificacionrequerimientosComponent implements OnInit {
  mostrarModal = false;
  procedimientos: any[] = [];
  datoEditar: any = null;
  constructor(private tablaService: TablaService, private listaService: EstadolistaService,
    private router: Router, private alertService: AlertService
  ) { }

  // Datos del formulario Ficha Tecnica de Procedimiento  
  columnas = [
    { key: 'Procedimiento', label: 'Procedimiento', },
    { key: 'Categoria', label: 'Categoría', },
    { key: 'Roles', label: 'Roles', },
    { key: 'Estado', label: 'Estado', },
    { key: 'Actividades', label: 'Actividades', },
    { key: 'Referentes', label: 'Referentes', },
  ];

  ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });
  }

  // Abrir Formulario modal
  abrirFormulario() {
    this.mostrarModal = true;
    this.datoEditar = null;
    document.body.classList.add('overflow-hidden');
  }

  // Editar procodemiento   
  editarProcedimiento(dato: any) {
    this.datoEditar = dato;
    console.log("el dato a editar es:", this.datoEditar)
    this.mostrarModal = true;
    document.body.classList.add('overflow-hidden');
  }

  // Cerrrar formulario modal
  cerrarFormulario() {
    this.mostrarModal = false;
    this.datoEditar = null;
    document.body.classList.remove('overflow-hidden');
  }

  // Estandarizar procedimiento
  estandarizarProcedimiento(dato: any) {
    this.router.navigate(['/estandarizar', dato]);
    console.log('dato recibido:', dato)
  }


  // Elimina el dato seleccionado y actualiza la tabla service
  eliminarProcedimiento(item: any) {
    this.alertService.alertEliminar().then((res) => {
      if (res.isConfirmed) {
        this.alertService.exito('procedimiento eliminado')
        this.procedimientos = this.procedimientos.filter(p => p !== item);
        this.tablaService.setProcedimientos(this.procedimientos);
      }
    });
  }

  // lista de procedimientos
  ListaProcedimientos() {
    this.listaService.abrir();
    this.router.navigate(['/socializacionprocedimientos']);
  }


  //Guarda los datos y los envia a la tabla service para que se actualice 
  guardarDatos(nuevoDato: any) {
    if (this.datoEditar) {
      const index = this.procedimientos.indexOf(this.datoEditar);
      if (index !== -1) {
        this.procedimientos[index] = nuevoDato;
      }
      this.datoEditar = null;
    } else {
      this.procedimientos.push(nuevoDato);
    }
    this.tablaService.setProcedimientos(this.procedimientos);
    this.cerrarFormulario();
    document.body.classList.remove('overflow-hidden')
   
    
  }
  
}


