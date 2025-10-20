import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentoBaseService {

  // Signal reactivo con los documentos base
  private documentosBaseSignal = signal<any[]>([]);

  documentosBase$ = this.documentosBaseSignal.asReadonly();

  constructor() {}

  setDocumentosBase(documentos: any[]) {
    this.documentosBaseSignal.set(documentos);
  }

  getDocumentosBase() {
    return this.documentosBaseSignal();
  }

  agregarDocumento(documento: any) {
    const actual = this.documentosBaseSignal();
    this.documentosBaseSignal.set([...actual, documento]);
  }

  eliminarDocumento(documento: any) {
    const actual = this.documentosBaseSignal();
    this.documentosBaseSignal.set(actual.filter(d => d !== documento));
  }

  limpiarDocumentos() {
    this.documentosBaseSignal.set([]);
  }
}