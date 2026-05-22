import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.css']
})
export class NavegacionComponent {


  private router = inject(Router);
  rutaAnterior = input<string>();
  rutaSiguiente = input<string>();
  posicion = signal<'ultima' | 'intermedia'>('intermedia');
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
    } if (indice === this.rutasOrdenadas.length - 1) {
      this.posicion.set('ultima');
    } else {
      this.posicion.set('intermedia');
    }
  }

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