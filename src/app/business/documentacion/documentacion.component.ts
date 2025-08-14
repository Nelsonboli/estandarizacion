
import { Component } from '@angular/core';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { RouterLink } from '@angular/router';
import { BotonCambiarComponent } from "../../shared/component/boton-cambiar/boton-cambiar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [RouterLink, BotonCambiarComponent, CommonModule, RouterLink],
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.css'
})
export class DocumentacionComponent {
activeSection: string = '';

  constructor(public tablaestandarizacionService: TablaestandarizacionService) {

  }

  recoleccioniformacion(){

  }

    ngOnInit() {
    const sections = document.querySelectorAll('section[id]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.activeSection = entry.target.id;
          }
        });
      },
      { threshold: 0.6 } // Visible el 60% para activar
    );

    sections.forEach(section => observer.observe(section));
  }

}
