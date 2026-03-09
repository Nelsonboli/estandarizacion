import { Router } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadolistaService } from '../../../../shared/services/estado-lista.service';


@Component({
  selector: 'app-lista-desplegable',
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './lista-desplegable.component.html',
  styleUrl: './lista-desplegable.component.css'
})
export class ListaDesplegableComponent implements OnInit {
  visible = model(false);
  cerrar = output<void>();
  items = input<any[]>([]);
  guardar = output<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = signal(false);
  procedimientos: any[] = [];
  selectedProcedimiento: number | null = null;

  //Servicios e inyecciones de dependencias
  private router = inject(Router);
  private listaService = inject(EstadolistaService);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      if (currentItems && currentItems.length > 0) {
        this.procedimientos = currentItems;
      }
    });
  }

  ngOnInit() {
    this.listaService.visible$.subscribe(valor => {
      this.visible.set(valor);
    });
  }

  Cancelar() {
    this.cerrar.emit();
    this.router.navigate(['/']);
  }

  Guardar() {
    console.log('Guardar clicked. Selected ID:', this.selectedProcedimiento);
    console.log('Available procedimientos:', this.procedimientos);

    const procedimiento = this.procedimientos.find(
      p => p.id === Number(this.selectedProcedimiento)
    );

    if (procedimiento) {
      console.log('Procedimiento found:', procedimiento);
      this.guardar.emit(procedimiento);
      this.cerrar.emit();
    } else {
      console.log('No se encontró el procedimiento seleccionado');
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const clickedOutside = !this.formularioRef.nativeElement.contains(event.target);
    if (clickedOutside) {
      this.escalar.set(true);
      setTimeout(() => {
        this.escalar.set(false);
      }, 320);
    }
  }

}

