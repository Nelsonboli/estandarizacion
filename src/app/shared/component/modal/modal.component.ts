import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormreutilizableComponent } from '../formreutilizable/formreutilizable.component';
import { AlertService } from '../../servicios/alert.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, FormreutilizableComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit { 
  @Input() visible = false;
  @Input() datoEditar: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = false;
  fichaTecnica = " Ficha tecnica de procedimiento"  

 constructor (private alertService: AlertService){} 

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


ngOnInit() {
  this.campos.forEach(campo => {
    this.form.addControl(
      campo.key,
      this.fb.control('', campo.required ? Validators.required : [])
    );
  });
}

campos = [
  { 
    key: 'Procedimiento', 
    label: 'Procedimiento',  
    Tooltip: 'Defina el procedimiento que desea estandarizar.', 
    required: true 
  },
  { 
    key: 'Categoria', 
    label: 'Categoría', 
    Tooltip: 'Seleccione la categoría a la cual pertenece el procedimiento.', 
    required: true 
  },
  { 
    key: 'Rol', 
    label: 'Rol', 
    Tooltip: 'Indique el rol o roles responsables de este procedimiento.', 
    required: true 
  },
  { 
    key: 'Estado', 
    label: 'Estado', 
    Tooltip: 'Especifique el estado actual del procedimiento (Inicial, Intermedio 1, Intermedio 2, Intermedio 3).', 
    required: true 
  },
  { 
    key: 'Actividades', 
    label: 'Actividades', 
    Tooltip: 'Liste las actividades que componen el procedimiento, en orden secuencial.', 
    required: true 
  },
  { 
    key: 'Referentes', 
    label: 'Referentes', 
    Tooltip: 'Agregue los documentos o normativas que sirvan de referencia para este procedimiento.', 
    required: true 
  },
];


  Cancelar() {
        this.cerrar.emit();
        this.form.reset();
      }
    
  
  
  Guardar(datos: any) {
  this.guardar.emit(datos);
  this.Cancelar()
}

}
