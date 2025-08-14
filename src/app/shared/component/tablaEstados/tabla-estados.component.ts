import { Component, Input } from '@angular/core';
import { TablaestandarizacionService } from '../../servicios/tablaestandarizacion.service';

@Component({
  selector: 'app-tabla-estados',
  imports: [],
  templateUrl: './tabla-estados.component.html',
  styleUrl: './tabla-estados.component.css'
})
export class TablaEstadosComponent {

  constructor(public tablaEstadosService: TablaestandarizacionService) {}

}
