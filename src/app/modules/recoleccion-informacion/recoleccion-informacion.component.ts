import { Component, inject } from '@angular/core';
import { DatosService } from '../../shared/services/datos.service';
import { TablaCriteriosComponent } from '../../shared/components/tabla-criterios/tabla-criterios.component';
import { TablaEstadosComponent } from "../../shared/components/tabla-estados/tabla-estados.component";
import { NavegacionComponent } from '../../shared/components/navegacion/navegacion';


@Component({
  selector: 'app-recoleccioninformacion',
  standalone: true,
  imports: [TablaCriteriosComponent, TablaEstadosComponent, NavegacionComponent],
  templateUrl: './recoleccion-informacion.component.html',
  styleUrl: './recoleccion-informacion.component.css'
})
export class RecoleccioninformacionComponent {
  public readonly datosService = inject(DatosService);

}



