import { Router } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadolistaService } from '../../servicios/estadolista.service';

@Component({
  selector: 'app-lista-desplegable',
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './lista-desplegable.component.html',
  styleUrl: './lista-desplegable.component.css'
})
export class ListaDesplegableComponent implements OnInit {
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();
  @Input() items: any[] = [];
  @Output() guardar = new EventEmitter<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = false;
  procedimientos: any[] = [];
  selectedProcedimiento: number | null = null;

  constructor(
    private router: Router,
    private listaService: EstadolistaService) { }

  ngOnInit() {
    this.listaService.visible$.subscribe(valor => {
      this.visible = valor;
    });
  }

  ngOnChanges() {
    if (this.items && this.items.length > 0) {
      this.procedimientos = this.items;
    }
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
      this.escalar = true;

      setTimeout(() => {
        this.escalar = false;
      }, 320);
    }
  }

}
