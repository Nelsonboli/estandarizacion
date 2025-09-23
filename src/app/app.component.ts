import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { TablaService } from './shared/servicios/tabla.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'estandarizacion';

  constructor(private viewport: ViewportScroller,private tablaService: TablaService) {
    // 100px de offset superior (ajusta a tu header)
    this.viewport.setOffset([0, 130]);
  }
  
}
