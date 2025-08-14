import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TablaprocedimientoComponent } from '../tablaprocedimiento/tablaprocedimiento.component';

@Component({
  selector: 'app-formreutilizable',
  imports: [ReactiveFormsModule, FormsModule, TablaprocedimientoComponent],
  templateUrl: './formreutilizable.component.html',
  styleUrl: './formreutilizable.component.css'
})
export class FormreutilizableComponent implements OnInit {
// Inputs y inicializacion de datos
  @Input() titulo: string | undefined; 
  @Input() campos: { key: string; label: string }[] = [];
  @Output() guardar = new EventEmitter<any>();
  @Output() cerrar = new EventEmitter<void>();
  form!: FormGroup;
  listaDatos: any[] = [];

  constructor(private fb: FormBuilder) {}

//ngOnInit
ngOnInit(): void {
  const group: any = {};
  for (const campo of this.campos) {
    group[campo.key] = ['', Validators.required];
  }
  this.form = this.fb.group(group);
}
// metodo que agrega solo el campo específico a el formulario
  agregarCampo(campo: string) {
    const control = this.form.get(campo);
    if (control && control.valid) {
      const nuevoRegistro = { [campo]: control.value };
      this.listaDatos.push(nuevoRegistro);
      console.log(this.listaDatos)
      control.reset(); // Limpia solo ese campo
    } else {
      control?.markAsTouched();
    }
  }

  // Filtra solo datos que contengan ese campo
  listaDatosFiltradas(campo: string) {
    return this.listaDatos.filter(d => d[campo] !== undefined);
  }
  
  //Metodo para elimnar el dato selecionado de la tabla
  eliminarDato(item: any) {
    this.listaDatos = this.listaDatos.filter(p => p !== item);
  }

  //Metodo para cerrar el formulario
  onCancel() {
    console.log('Formulario cancelado');
    this.cerrar.emit()
    this.form.reset();
    this.listaDatos = [];
  }

  //Metodo para enviar los datos del formulario 
  enviarFormulario() {
    if (this.form.valid) {
      console.log('Datos completos:', this.form.value);
      this.form.reset();
      console.log(this.form)
    } else {
      this.form.markAllAsTouched();
    }
  }

}
