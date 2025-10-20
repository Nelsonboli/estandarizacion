import { Component, Input } from '@angular/core';
import { DatosTablaService } from '../../servicios/datosTablas.service';

@Component({
  selector: 'app-tabla-estados',
  imports: [],
  templateUrl: './tabla-estados.component.html',
  styleUrl: './tabla-estados.component.css'
})
export class TablaEstadosComponent {

  constructor(public tablaEstadosService: DatosTablaService) {}

}
