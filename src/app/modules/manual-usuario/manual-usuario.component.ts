import { Component } from '@angular/core';
import { NavegacionComponent } from '../../shared/components/navegacion/navegacion';
import { EstadolistaService } from '../../shared/services/estado-lista.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manualusuario',
  imports: [NavegacionComponent],
  templateUrl: './manual-usuario.component.html',
  styleUrl: './manual-usuario.component.css'
})
export class ManualusuarioComponent {

  constructor(private listaService: EstadolistaService, private router: Router) { }

  abrirListaSocializacion() {
    this.listaService.abrir();
  }
}

