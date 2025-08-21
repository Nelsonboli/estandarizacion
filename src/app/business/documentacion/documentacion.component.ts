
import { Component, HostListener } from '@angular/core';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NavegacionComponent } from "../../shared/component/navegacion/navegacion";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [RouterLink, NavegacionComponent, CommonModule],
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.css'
})
export class DocumentacionComponent {
  activeSection: string = '';

 constructor(public tablaestandarizacionService: TablaestandarizacionService, 
  private router: Router) {

  // Cuando se termina de navegar
  this.router.events.pipe(
    filter(e => e instanceof NavigationEnd)
  ).subscribe(() => {
    const tree = this.router.parseUrl(this.router.url);
    if (tree.fragment) {
      const element = document.getElementById(tree.fragment);
      if (element) {
        // Compensar el header fijo (80px aprox)
        const yOffset = -80; 
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });


  }


}
