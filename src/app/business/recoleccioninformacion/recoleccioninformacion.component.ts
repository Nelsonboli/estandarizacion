import { Component } from '@angular/core';
import { RouterLink} from '@angular/router';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { DocumentacionComponent } from "../documentacion/documentacion.component";

@Component({
  selector: 'app-recoleccioninformacion',
  imports: [RouterLink, DocumentacionComponent],
  templateUrl: './recoleccioninformacion.component.html',
  styleUrl: './recoleccioninformacion.component.css'
})
export class RecoleccioninformacionComponent {
  constructor(public tablaestandarizacionService: TablaestandarizacionService ) {

  }
}
