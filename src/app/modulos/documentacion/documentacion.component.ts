import { Component, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { NavegacionComponent } from "../../shared/component/navegacion/navegacion";

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [CommonModule, NavegacionComponent],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css']
})
export class DocumentacionComponent implements OnInit, OnDestroy, AfterViewInit {
  activeSection: string = '';
  private destroy$ = new Subject<void>();
  private sections: HTMLElement[] = [];

  ngOnInit(): void {
  
  }

  ngAfterViewInit(): void {
    // Guardamos las secciones del contenido
    this.sections = Array.from(document.querySelectorAll('section'));
    this.onScroll(); // Inicializa el activo al cargar
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Detecta el scroll y actualiza la sección activa */
  @HostListener('window:scroll', [])
  onScroll(): void {
    let currentSection = '';

    for (const section of this.sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120 && rect.bottom >= 120) { // posición visible en viewport
        currentSection = section.id;
        break;
      }
    }

    if (currentSection && this.activeSection !== currentSection) {
      this.activeSection = currentSection;
    }
  }

  /** Hace scroll suave a la sección */
  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  /** Vuelve al inicio */
  scrollToTop(): void {
    window.scrollTo({ top: 20, behavior: 'smooth' });
    this.activeSection = '';
  }
}
