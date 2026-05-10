import { Component, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import { NavegacionComponent } from '../../shared/components/navegacion/navegacion';
import { SidebarService } from '../../shared/services/sidebar.service';


@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [CommonModule, NavegacionComponent],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css']
})
export class DocumentacionComponent implements OnDestroy, AfterViewInit {
  activeSection: string = '';
  private destroy$ = new Subject<void>();
  private sections: HTMLElement[] = [];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  constructor(public sidebarService: SidebarService) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.sections = Array.from(
      this.scrollContainer.nativeElement.querySelectorAll('section')
    );

    // Optimización: Uso de RxJS para manejar el evento de scroll con limpieza automática
    fromEvent(this.scrollContainer.nativeElement, 'scroll')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onScroll());

    // Ejecución inicial para detectar sección activa
    this.onScroll();
  }

  /** Detecta el scroll y actualiza la sección activa */
  private onScroll(): void {
    if (!this.sections.length) return;

    const scrollPosition = this.scrollContainer.nativeElement.scrollTop;
    const offset = 150;
    let currentSection = '';

    for (const section of this.sections) {
      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollPosition + offset >= sectionTop && scrollPosition + offset < sectionBottom) {
        currentSection = section.id;
        break;
      }
    }

    if (!currentSection && scrollPosition < 100) {
      currentSection = '';
    }

    if (this.activeSection !== currentSection) {
      this.activeSection = currentSection;
    }
  }

  scrollToSection(sectionId: string): void {
    const section = this.sections.find(s => s.id === sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.activeSection = sectionId;
    }
  }

  /** Vuelve al inicio */
  scrollToTop(): void {
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      const firstChild = container.firstElementChild as HTMLElement;
      if (firstChild) {
        firstChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
      this.activeSection = '';
    }
  }
}


