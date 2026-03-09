import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EstadolistaService } from '../../shared/services/estado-lista.service';


@Component({
  selector: 'app-menu-lateral',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-lateral.component.html',
  styleUrl: './menu-lateral.component.css'
})
export class MenulateralComponent {

  constructor(private listaService: EstadolistaService) { }

  ListaProcedimientos() {
    this.listaService.abrir();
  }

}

