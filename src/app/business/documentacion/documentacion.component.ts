import { Component, HostListener, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { TablaestandarizacionService } from '../../shared/servicios/tablaestandarizacion.service';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { NavegacionComponent } from "../../shared/component/navegacion/navegacion";
import { CommonModule } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [ NavegacionComponent, CommonModule],
  templateUrl: './documentacion.component.html',
  styleUrl: './documentacion.component.css'
})
export class DocumentacionComponent implements OnInit, OnDestroy, AfterViewInit {
  activeSection: string = '';
  private destroy$ = new Subject<void>();
window: any;

  constructor(
    public tablaestandarizacionService: TablaestandarizacionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en el fragment desde la URL
    this.route.fragment.pipe(
      takeUntil(this.destroy$)
    ).subscribe(fragment => {
      if (fragment) {
        // Delay para asegurar que el DOM esté listo
        setTimeout(() => {
          this.scrollToFragment(fragment);
          this.activeSection = fragment;
        }, 200);
      }
    });

    // También escuchar los eventos de navegación completa
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      setTimeout(() => {
        const tree = this.router.parseUrl(this.router.url);
        if (tree.fragment) {
          this.scrollToFragment(tree.fragment);
          this.activeSection = tree.fragment;
        }
      }, 300);
    });
  }

  ngAfterViewInit(): void {
    // Verificar si hay un fragment en la URL al cargar
    const currentFragment = this.route.snapshot.fragment;
    if (currentFragment) {
      setTimeout(() => {
        this.scrollToFragment(currentFragment);
        this.activeSection = currentFragment;
      }, 500);
    }

    // Detectar la sección activa inicial
    setTimeout(() => {
      this.detectActiveSection();
    }, 600);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private scrollToFragment(fragment: string): void {
    const element = document.getElementById(fragment);
    if (element) {
      // Calcular el offset considerando tu header fijo
      // Estimando: header principal (~64px) + nav (~48px) + padding extra
      const headerHeight = 120; // Ajusta este valor según tu header real
      
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const offsetTop = elementTop - headerHeight;
      
      window.scrollTo({ 
        top: offsetTop, 
        behavior: 'smooth' 
      });

      console.log('Navegando a:', fragment, 'Posición:', offsetTop);
    } else {
      console.warn('Elemento no encontrado:', fragment);
    }
  }

  private detectActiveSection(): void {
    const sections = ['definiciones', 'mapa', 'metodologia'];
    const headerHeight = 120;
    
    for (let section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;
        
        // Si la sección está visible en el viewport considerando el header
        if (top <= headerHeight + 50 && bottom >= headerHeight) {
          if (this.activeSection !== section) {
            this.activeSection = section;
            console.log('Sección activa:', section);
          }
          break;
        }
      }
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.detectActiveSection();
  }

  // Método para manejar clics en los enlaces del menú
  onMenuClick(fragment: string, event: Event): void {
    event.preventDefault();
    
    console.log('Click en menú:', fragment);
    
    // Actualizar la sección activa inmediatamente
    this.activeSection = fragment;
    
    // Navegar al fragment
    this.router.navigate([], { 
      fragment: fragment,
      relativeTo: this.route 
    }).then(() => {
      // Hacer scroll después de la navegación
      setTimeout(() => {
        this.scrollToFragment(fragment);
      }, 100);
    });
  }

  // Método para volver arriba
  scrollToTop(): void {
    window.scrollTo({
      top: 0, 
      behavior: 'smooth'
    });
    this.activeSection = '';
  }
}