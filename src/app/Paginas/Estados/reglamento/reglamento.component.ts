import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit{
  seccionActiva: 'descargar' | 'validar' | null = null;

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

      pasos: any[] = [
      {id: '✅', titulo: 'Envíar Documento a la DAAC', responsable: 'DAAC' },
      {id: '✅', titulo: 'Documento Revisado por la DAAC', responsable:'DAAC'  },
      {id: '✅', titulo: 'Enviar Documento a Consejo de Facultad Para Aprobacion', responsable: 'Consejo de Facultad'},
      {id: '✅', titulo: 'Documento aprobado por Cosejo de Facultad', responsable: 'Consejo de Facultad' }
  ];

 ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['', Validators.required],
      detalle1: [''],
    });
    }

    onSubmit(){

    }



}
