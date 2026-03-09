import { Component, ElementRef, inject, OnInit, ViewChild, input, output, signal } from '@angular/core'; import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatosService } from '../../../../shared/services/datos.service';
import { FormreutilizableComponent } from '../../../../shared/components/form-reutilizable/form-reutilizable.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormreutilizableComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  visible = input(false);
  datoEditar = input<any>(null);
  cerrar = output<void>();
  guardar = output<any>();
  @ViewChild('formulario') formularioRef!: ElementRef;
  escalar = signal(false);

  fb = inject(FormBuilder);
  form = this.fb.group({});

  constructor(
    public datosService: DatosService
  ) { }

  onBackdropClick(event: MouseEvent): void {
    const clickedOutside = !this.formularioRef.nativeElement.contains(event.target);
    if (clickedOutside) {
      this.escalar.set(true);
      setTimeout(() => {
        this.escalar.set(false);
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

