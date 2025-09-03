import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TablaService } from '../../servicios/tabla.service';
import { FormsModule } from '@angular/forms';
import { EstadolistaService } from '../../servicios/estadolista.service';

@Component({
  selector: 'app-lista-desplegable',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-desplegable.component.html',
  styleUrl: './lista-desplegable.component.css'
})
export class ListaDesplegableComponent implements OnInit {
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = false;
  procedimientos: any[] = [];
  selectedProcedimiento: any = '';

  constructor(private tablaService: TablaService, private router: Router, private listaService: EstadolistaService) { }

  ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });

      this.listaService.visible$.subscribe(valor => {
    this.visible = valor;
  });
  }

  onCancel() {
    this.cerrar.emit();
    this.router.navigate(['/']);
  }

  onGuardar() {
    const procedimiento = this.procedimientos.find(
      p => p.Procedimiento === this.selectedProcedimiento
    );
    if (procedimiento) {
      this.guardar.emit(procedimiento);
      this.cerrar.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const clickedOutside = !this.formularioRef.nativeElement.contains(event.target);
    if (clickedOutside) {
      this.escalar = true;

      setTimeout(() => {
        this.escalar = false;
      }, 300);
    }
  }

}
