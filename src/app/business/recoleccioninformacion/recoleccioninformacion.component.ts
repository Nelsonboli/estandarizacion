import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { TablaCriteriosComponent } from '../../shared/component/tablaCriterios/tablaCriterios.component';
import { TablaEstadosComponent } from "../../shared/component/tablaEstados/tabla-estados.component";
import { BotonCambiarComponent } from '../../shared/component/boton-cambiar/boton-cambiar.component';


@Component({
  selector: 'app-recoleccioninformacion',
  standalone: true,
  imports: [TablaCriteriosComponent, TablaEstadosComponent, BotonCambiarComponent],
  templateUrl: './recoleccioninformacion.component.html',
  styleUrl: './recoleccioninformacion.component.css'
})
export class RecoleccioninformacionComponent {
  constructor(public tablaestandarizacionService: TablaestandarizacionService ) {

  }
}
