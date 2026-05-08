import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  procedimientoId = input<number>(0);
}
