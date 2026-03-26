import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { MenulateralComponent } from '../menu-lateral/menu-lateral.component';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet, NgClass, MenulateralComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  colapsar = false;
  esMenuPrincipal = false;   // bandera para saber si estoy en la ruta del menú principal

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      this.esMenuPrincipal = url === '/'; // ajusta al path real
      this.colapsar = false; // cada vez que navega, sidebar inicia expandido
    });

  }

  toggleSidebar() {
    if (!this.esMenuPrincipal) {
      this.colapsar = !this.colapsar;
    }
  }
}
