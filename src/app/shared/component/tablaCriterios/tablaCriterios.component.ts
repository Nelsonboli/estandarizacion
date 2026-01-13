import { Component, Input } from '@angular/core';
import { FormatearArrayPipe } from "../../pipes/formatear-array.pipe";

@Component({
  selector: 'app-tabla-criterios',
  templateUrl: './tablaCriterios.component.html',
  styleUrls: ['./tablaCriterios.component.css'],
  imports: [FormatearArrayPipe]
})
export class TablaCriteriosComponent {
  @Input() columnas: string[] = [];

  @Input() filas: { Criterio: string, Descripcion: any, Tooltip?: string }[] = []
}
