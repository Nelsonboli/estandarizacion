import { Component } from '@angular/core';
import { Router, } from '@angular/router';
import { EstadolistaService } from '../../shared/services/estado-lista.service';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './menu-principal.component.html',
  styleUrl: './menu-principal.component.css'
})
export class menuprincipalComponent {

  constructor(private listaService: EstadolistaService,
    private router: Router) {
  }

  ListaProcedimientos() {
    this.listaService.abrir();
  }

  redireccion(opcion: number) {
    switch (opcion) {
      case (1):
        this.router.navigate(['/acercadeestandarizacion']);
        break;
      case (2):
        this.router.navigate(['/recoleccioninformacion']);
        break;
      case (3):
        this.router.navigate(['/identificacionrequerimientos']);
        break;
      case (4):
        this.router.navigate(['/socializacionprocedimientos']);
        break;
      case (5):
        this.router.navigate(['/manualusuario']);
        break;
    }
  }
}
