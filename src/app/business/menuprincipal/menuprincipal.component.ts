import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListaDesplegableComponent } from '../../shared/component/lista-desplegable/lista-desplegable.component';
import { EstadolistaService } from '../../shared/servicios/estadolista.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './menuprincipal.component.html',
  styleUrl: './menuprincipal.component.css'
})
export class menuprincipalComponent {

  constructor(private listaService: EstadolistaService) {
  }

  abrirLista() {
  this.listaService.abrir();
  }

}
