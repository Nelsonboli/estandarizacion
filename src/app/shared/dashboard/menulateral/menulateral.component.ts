import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EstadolistaService } from '../../servicios/estadolista.service';

@Component({
  selector: 'app-menulateral',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menulateral.component.html',
  styleUrl: './menulateral.component.css'
})
export class MenulateralComponent {

  constructor(private listaService: EstadolistaService) { }
  
  ListaProcedimientos() {
    this.listaService.abrir();
  }

}
