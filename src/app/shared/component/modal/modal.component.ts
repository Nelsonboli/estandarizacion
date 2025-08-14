import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TablaService } from '../../servicios/tabla.service';
import { FormreutilizableComponent } from '../formreutilizable/formreutilizable.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, FormreutilizableComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit { 
  @Input() visible = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = false;
  fichaTecnica = " Ficha tecnica de procedimiento"  

onBackdropClick(event: MouseEvent): void {
    const clickedOutside = !this.formularioRef.nativeElement.contains(event.target);
    if (clickedOutside) {
      this.escalar = true;

      setTimeout(() => {
        this.escalar = false;
      }, 300);
    }
  }

  
fb = inject(FormBuilder);
form = this.fb.group({});


constructor(private tablaService: TablaService ){
}

ngOnInit() {
  this.campos.forEach(campo => {
    this.form.addControl(
      campo.key,
      this.fb.control('', campo.required ? Validators.required : [])
    );
  });
}


  campos = [
  { key: 'Procedimiento', label: 'Procedimiento', required: true },
  { key: 'Categoria', label: 'Categoria', required: true },
  { key: 'Rol', label: 'Rol' },
  { key: 'Estado', label: 'Estado' },
  { key: 'Actividades', label: 'Actividades' },
  { key: 'Referentes', label: 'Referentes' },
];

  onSubmit() {
    if (this.form.valid) {
      const nuevo = this.form.value
      this.guardar.emit(nuevo);
    } else {
      this.form.markAllAsTouched();
    }
  }
  
  onCancel() {
    this.cerrar.emit();
    this.form.reset();
  }
}
