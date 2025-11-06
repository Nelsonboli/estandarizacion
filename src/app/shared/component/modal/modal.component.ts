import { DatosService } from './../../servicios/datos.service';
import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormreutilizableComponent } from '../formreutilizable/formreutilizable.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormreutilizableComponent],
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

  fb = inject(FormBuilder);
  form = this.fb.group({});

  constructor(
    public datosService: DatosService
  ) { }

  onBackdropClick(event: MouseEvent): void {
    const clickedOutside = !this.formularioRef.nativeElement.contains(event.target);
    if (clickedOutside) {
      this.escalar = true;
      setTimeout(() => {
        this.escalar = false;
      }, 300);
    }
  }

  ngOnInit() {
    const datosformulario = this.datosService.camposFormularioFTP
    datosformulario.forEach(campo => {
      this.form.addControl(
        campo.key,
        this.fb.control('', campo.required ? Validators.required : [])
      );
    });
  }

  Cancelar() {
    this.cerrar.emit();
    this.form.reset();
  }

  Guardar(datos: any) {
    this.guardar.emit(datos);
    this.Cancelar()
  }


}
