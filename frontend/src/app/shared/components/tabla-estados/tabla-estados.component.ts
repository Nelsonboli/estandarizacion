import { Component, inject } from '@angular/core';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-tabla-estados',
  imports: [],
  templateUrl: './tabla-estados.component.html',
  styleUrl: './tabla-estados.component.css'
})
export class TablaEstadosComponent {
  DatosService = inject(DatosService)
}
