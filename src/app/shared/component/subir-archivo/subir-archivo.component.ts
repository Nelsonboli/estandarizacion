import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-subir-archivo',
  imports: [],
  templateUrl: './subir-archivo.component.html',
  styleUrl: './subir-archivo.component.css'
})
export class SubirArchivoComponent {


  // Subida de archivos
  isDragging = false;
  selectedFileName: string | null = null;
  @Output() fileUploaded = new EventEmitter<File>();

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];

    if (file) {
      this.handleFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    this.selectedFileName = file.name;
    this.fileUploaded.emit(file);
  }

  guardarDocumento() {

  }

  cancelarDocumento() {

  }




}
