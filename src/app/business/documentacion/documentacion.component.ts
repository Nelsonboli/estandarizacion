import { Component } from '@angular/core';
import { TablaService } from '../../shared/servicios/tabla.service';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';

@Component({
  selector: 'app-documentacion',
  imports: [],
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.css'
})
export class DocumentacionComponent {

constructor(public tablaestandarizacionService: TablaestandarizacionService ) {

  }

}
