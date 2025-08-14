import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tabla-criterios',
  templateUrl: './tablaCriterios.component.html',
  styleUrls: ['./tablaCriterios.component.css']
})
export class TablaCriteriosComponent {
    @Input() columnas: string[] = [];

  // Recibe las filas como array de objetos
    @Input() filas: {Criterio:string,Descripcion:string,Tooltip?:string}[] = []
}
