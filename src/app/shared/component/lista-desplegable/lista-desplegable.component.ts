import { CommonModule, NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TablaService } from '../../servicios/tabla.service';
import { FormsModule } from '@angular/forms';

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
  selectedProcedimiento: any = null;

    constructor(private tablaService: TablaService) {}

  ngOnInit() {
    this.tablaService.procedimientos$.subscribe(data => {
      this.procedimientos = data;
    });
  }

  onCancel() {
    this.cerrar.emit();
    // this.form.reset();
  }
  
  onGuardar() {
  const procedimiento = this.procedimientos.find(
    p => p.Procedimiento === this.selectedProcedimiento
  );
  this.guardar.emit(procedimiento);
  this.onCancel();
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
