import { Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-card-documento',
  imports: [],
  templateUrl: './card-documento.component.html',
  styleUrl: './card-documento.component.css'
})
export class CardDocumentoComponent {
  selectedFile = input<File | null>();
  selectedFileName = input<string | null>();
  filePreviewUrl = input<SafeResourceUrl | null>();
  eliminarArchivoEvent = output<void>();
  private sanitizer = inject(DomSanitizer);

  previewPdfUrl = computed(() => {
    const file = this.selectedFile();
    if (file && file.type === 'application/pdf') {
      const rawUrl = URL.createObjectURL(file) + '#page=1&view=FitH&scrollbar=0&toolbar=0&navpanes=0';
      return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    }
    return this.filePreviewUrl();
  });

  eliminarArchivo() {
    this.eliminarArchivoEvent.emit();
  }

}
