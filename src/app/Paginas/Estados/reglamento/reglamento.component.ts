import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubirArchivoComponent } from "../../../shared/component/subir-archivo/subir-archivo.component";
import { DocumentoSoporteService } from '../../../shared/servicios/modulos/documento-soporte.service';
import { FormularioDAACService } from '../../../shared/servicios/modulos/formulario-daac.service';
import { FormatoEstandarizacionComponent } from "../../../shared/component/formato-estandarizacion/formato-estandarizacion.component";

@Component({
  standalone: true,
  selector: 'app-reglamento',
  imports: [ReactiveFormsModule, SubirArchivoComponent, FormatoEstandarizacionComponent],
  templateUrl: './reglamento.component.html',
  styleUrl: './reglamento.component.css'
})
export class ReglamentoComponent implements OnInit {
  descargaActiva: 'descargarProcedimiento' | 'descargarEstandarizacion' | null = null;
  subidaActiva: 'subirProcedimiento' | 'subirEstandarizacion' | null = null;
  formatoEstandarizacion = "Formato de Estandarizacion"
  fichaProcedimiento = "Ficha de Procedimiento"
  @Input() procedimientoId!: number;
  form!: FormGroup;
  subiendo = false;

  constructor(
    private fb: FormBuilder,
    private documentoSoporteService: DocumentoSoporteService,
    private formularioDAACService: FormularioDAACService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      respuesta1: ['', Validators.required],
      detalle1: [''],
    });

  }

  onSubmit() {
  }

  subirArchivoEstandarizacion(file: File) {
  }

  subirArchivoProcedimiento(file: File) {
  }


}

