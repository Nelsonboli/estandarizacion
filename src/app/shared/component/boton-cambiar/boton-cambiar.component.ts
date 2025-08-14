import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boton-cambiar',
  standalone:true,
  imports: [RouterLink,CommonModule],
  templateUrl: './boton-cambiar.component.html',
  styleUrl: './boton-cambiar.component.css'
})
export class BotonCambiarComponent {
  @Input() rutaAnterior!: string;
  @Input() rutaSiguiente!: string;
  @Input() posicion!: 'primera' | 'ultima' | 'intermedia';


  // Lista de rutas en orden para determinar la posición
  private rutasOrdenadas: string[] = [
    '/acercadeestandarizacion',
    '/recoleccioninformacion',
    '/identificacionrequerimientos',
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const rutaActual = this.router.url;
    const indice = this.rutasOrdenadas.indexOf(rutaActual);

    if (indice === 0) {
      this.posicion = 'primera';
    } else if (indice === this.rutasOrdenadas.length - 1) {
      this.posicion = 'ultima';
    } else {
      this.posicion = 'intermedia';
    }
  }


}