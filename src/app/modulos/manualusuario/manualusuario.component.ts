import { Component } from '@angular/core';
import { NavegacionComponent } from '../../shared/component/navegacion/navegacion';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manualusuario',
  imports: [ NavegacionComponent],
  templateUrl: './manualusuario.component.html',
  styleUrl: './manualusuario.component.css'
})
export class ManualusuarioComponent {

    constructor(private listaService: EstadolistaService, private router: Router) {}

abrirListaSocializacion() {
  this.listaService.abrir(); // También abre la lista al volver a Socialización
}
}
