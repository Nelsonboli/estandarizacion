import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-subsistema',
  imports: [RouterLink, NgClass],
  templateUrl: './subsistema.component.html',
  styleUrl: './subsistema.component.css'
})
export class SubsistemaComponent {
  mostrarMenu = signal(true);

  menuGestionCalidad = [
    {
      nombre: 'Estandarización de procedimientos',
      ruta: '/menuprincipal'
    }
  ]

  mostrarModulo() {
    this.mostrarMenu.update((value) => !value);
  }


}
