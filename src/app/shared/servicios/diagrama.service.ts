import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiagramaService {
  // Signal reactiva con la imagen guardada
  diagramaGuardado = signal<string | null>(null);

  guardarImagen(base64: string) {
    this.diagramaGuardado.set(base64);
    localStorage.setItem('diagramaBase64', base64); // persistencia opcional
  }

  cargarImagen(): string | null {
    const localData = localStorage.getItem('diagramaBase64');
    if (localData && !this.diagramaGuardado()) {
      this.diagramaGuardado.set(localData);
    }
    return this.diagramaGuardado();
  }

  limpiar() {
    this.diagramaGuardado.set(null);
    localStorage.removeItem('diagramaBase64');
  }
}
