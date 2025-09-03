import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navegacion',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './navegacion.component.html',
  styleUrls: ['./navegacion.component.css']
})
export class NavegacionComponent {
  @Input() rutaAnterior!: string;
  @Input() rutaSiguiente!: string;
  @Input() posicion!: 'primera' | 'ultima' | 'intermedia';
  @Output() siguiente = new EventEmitter<void>();
  @Output() anterior = new EventEmitter<void>();
  
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
      this.posicion = 'primera';
    } else if (indice === this.rutasOrdenadas.length - 1) {
      this.posicion = 'ultima';
    } else {
      this.posicion = 'intermedia';
    }
  }

  constructor(private router: Router) {}

  irAnterior() {
    this.anterior.emit();  // Notifica al padre (si quiere hacer algo extra)
    if (this.rutaAnterior) {
      this.router.navigate([this.rutaAnterior]); // Navega automáticamente
    }
  }

  irSiguiente() {
    this.siguiente.emit(); // Notifica al padre (si quiere hacer algo extra)
    if (this.rutaSiguiente) {
      this.router.navigate([this.rutaSiguiente]); // Navega automáticamente
    }
  }

}