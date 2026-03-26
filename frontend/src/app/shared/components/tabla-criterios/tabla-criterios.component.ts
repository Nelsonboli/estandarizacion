import { Component, input } from '@angular/core';
import { FormatearArrayPipe } from "../../pipes/formatear-array.pipe";
import { Criterios } from '../../interfaces/tablas.interface';

@Component({
  selector: 'app-tabla-criterios',
  templateUrl: './tabla-criterios.component.html',
  styleUrls: ['./tabla-criterios.component.css'],
  imports: [FormatearArrayPipe]
})
export class TablaCriteriosComponent {
  columnas = input<string[]>([]);
  filas = input<Criterios[]>([]);
}

