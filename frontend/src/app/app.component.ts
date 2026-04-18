import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { TablaProcedimientoService } from './modules/identificacion-requerimientos/services/tabla-procedimiento.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'estandarizacion';

  constructor(private viewport: ViewportScroller) {
    this.viewport.setOffset([0, 130]);
  }

}
