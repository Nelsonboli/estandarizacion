import { Component, HostListener, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  ngAfterViewInit(): void {
    this.sections = Array.from(
      this.scrollContainer.nativeElement.querySelectorAll('section')
    );

    this.scrollContainer.nativeElement.addEventListener('scroll', () => {
      this.onScroll();
    });

    this.onScroll();
  }


  /** Detecta el scroll y actualiza la sección activa */
  onScroll(): void {
    if (!this.sections.length) return;

    const scrollPosition = this.scrollContainer.nativeElement.scrollTop;
    const offset = 150; // Offset desde el top del contenedor

    let currentSection = '';

    // Recorrer las secciones de arriba hacia abajo
    for (const section of this.sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      // Si el scroll está dentro de esta sección (con offset)
      if (scrollPosition + offset >= sectionTop && scrollPosition + offset < sectionBottom) {
        currentSection = section.id;
        break;
      }
    }

    // Si no encontramos ninguna sección, verificar si estamos al inicio
    if (!currentSection && scrollPosition < 100) {
      currentSection = '';
    }

    if (this.activeSection !== currentSection) {
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
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      const firstChild = this.scrollContainer.nativeElement.firstElementChild;
      if (firstChild) {
        firstChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Fallback: scroll directo al contenedor
        this.scrollContainer.nativeElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      this.activeSection = '';
    }
  }

}
