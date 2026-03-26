import { Router } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadolistaService } from '../../../../shared/services/estado-lista.service';
import { Procedimiento } from '../../../identificacion-requerimientos/interfaces/procedimiento.interface';
import { AlertService } from '../../../../shared/services/alert.service';



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
  procedimientos: Procedimiento[] = [];
  seleccionProcedimiento: number | null = null;

  //Servicios e inyecciones de dependencias
  private router = inject(Router);
  private listaService = inject(EstadolistaService);
  private alertService = inject(AlertService);

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
    const procedimiento = this.procedimientos.find(
      p => p.id === Number(this.seleccionProcedimiento)
    );
    if (procedimiento) {
      this.guardar.emit(procedimiento);
      this.cerrar.emit();
    }
    else {
      this.alertService.info('debe seleccionar un procedimiento');
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

