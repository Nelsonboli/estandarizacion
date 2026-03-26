import { Component, inject, output, signal } from '@angular/core';
import { AlertService } from '../../../../shared/services/alert.service';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { CardDocumentoComponent } from "../card-documento/card-documento.component";
import { documentoSubido } from '../../interfaces/reglamento.interface';

@Component({
  selector: 'app-subir-archivo',
  imports: [NgClass, MatIconModule, CardDocumentoComponent],
  templateUrl: './subir-archivo.component.html',
  styleUrl: './subir-archivo.component.css'
})
export class SubirArchivoComponent {
  isDragging = signal(false)
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);
  filePreviewUrl = signal<SafeResourceUrl | null>(null);
  fileUploaded = output<File>();
  maxSize = 100 * 1024 * 1024;
  allowedTypes = ['application/pdf'];
  cancelarSubidaDocumentoDAAC = output<void>();
  guardarSubidaDocumentoDAAC = output<File>();

  //Servicios e inyecciones
  private alertService = inject(AlertService);
  private sanitizer = inject(DomSanitizer);

  archivoSeleccionadoEvent = output<documentoSubido>();


  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.procesarArchivo(file);
    }
  }

  private procesarArchivo(file: File) {
    if (!this.allowedTypes.includes(file.type)) this.alertService.error('Solo se permiten archivos PDF');
    if (file.size > this.maxSize) this.alertService.error('El archivo no puede superar los 100MB');
    this.selectedFile.set(file);
    this.selectedFileName.set(file.name);
    const url = URL.createObjectURL(file) + '#page=1';
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.filePreviewUrl.set(safeUrl);
    this.archivoSeleccionadoEvent.emit({
      file,
      fileName: file.name,
      previewUrl: safeUrl
    });
    this.fileUploaded.emit(file)
  }


  guardarDocumentoDAAC() {
    if (!this.selectedFile()) {
      this.alertService.error('Debe subir un archivo para guardar');
      return;
    }
    this.guardarSubidaDocumentoDAAC.emit(this.selectedFile()!);
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
  }

  cancelarDocumentoDAAC() {
    if (this.selectedFile()) {
      this.alertService.alertCancelar().then(res => {
        if (res.isConfirmed) {
          this.cancelarSubidaDocumentoDAAC.emit();
          this.selectedFile.set(null);
          this.selectedFileName.set(null);
        }
      })
    } else {
      this.cancelarSubidaDocumentoDAAC.emit();
      this.selectedFile.set(null);
      this.selectedFileName.set(null);
    }
  }

  eliminarArchivo() {
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.filePreviewUrl.set(null);
  }

}
