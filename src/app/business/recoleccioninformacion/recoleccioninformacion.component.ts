import { Component } from '@angular/core';
import { DatosTablaService } from '../../shared/servicios/datosTablas.service';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { TablaEstadosComponent } from "../../shared/component/tablaEstados/tabla-estados.component";
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';


@Component({
  selector: 'app-recoleccioninformacion',
  standalone: true,
  imports: [TablaCriteriosComponent, TablaEstadosComponent, NavegacionComponent, NavegacionComponent],
  templateUrl: './recoleccioninformacion.component.html',
  styleUrl: './recoleccioninformacion.component.css'
})
export class RecoleccioninformacionComponent {
  constructor(public tablaestandarizacionService: DatosTablaService ) {

  }
}
