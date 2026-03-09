import { Component, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.css']
})
export class NavegacionComponent {
  rutaAnterior = input<string>();
  rutaSiguiente = input<string>();
  posicion = signal<'primera' | 'ultima' | 'intermedia'>('intermedia');
  siguiente = output<void>();
  anterior = output<void>();

  // Lista de rutas en orden para determinar la posición
  private rutasOrdenadas: string[] = [
    '/acercadeestandarizacion',
    '/recoleccioninformacion',
    '/identificacionrequerimientos',
    '/socializacionprocedimientos',
    '/manualusuario'
  ];

  ngOnInit() {
    const rutaActual = this.router.url;
    const indice = this.rutasOrdenadas.indexOf(rutaActual);

    if (indice === 0) {
      this.posicion.set('primera');
    } else if (indice === this.rutasOrdenadas.length - 1) {
      this.posicion.set('ultima');
    } else {
      this.posicion.set('intermedia');
    }
  }

  constructor(private router: Router) { }

  irAnterior() {
    this.anterior.emit();  // Notifica al padre (si quiere hacer algo extra)
    const prev = this.rutaAnterior();
    if (prev) {
      this.router.navigate([prev]); // Navega automáticamente
    }
  }

  irSiguiente() {
    this.siguiente.emit(); // Notifica al padre (si quiere hacer algo extra)
    const next = this.rutaSiguiente();
    if (next) {
      this.router.navigate([next]); // Navega automáticamente
    }
  }

}