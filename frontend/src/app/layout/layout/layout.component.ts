import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { MenulateralComponent } from '../menu-lateral/menu-lateral.component';
import { SidebarService } from '../../shared/services/sidebar.service';


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

  constructor(private router: Router, private sidebarService: SidebarService) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      // Consideramos menú principal tanto la raíz como /menuprincipal
      this.esMenuPrincipal = url === '/' || url === '/menuprincipal'; 
      this.colapsar = false; 
      this.sidebarService.setColapsado(false);
    });

    // Sincronizar el estado local con el servicio
    this.sidebarService.colapsado$.subscribe(val => this.colapsar = val);
  }

  toggleSidebar() {
    if (!this.esMenuPrincipal) {
      this.sidebarService.toggle();
    }
  }
}
