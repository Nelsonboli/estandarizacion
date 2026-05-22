import { Component, TemplateRef, computed, input, model, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormatearArrayPipe } from '../../pipes/formatear-array.pipe';
import { Campos } from '../../interfaces/campos.interface';


@Component({
  selector: 'app-tabla-datos',
  imports: [CommonModule, FormatearArrayPipe, TitleCasePipe],
  templateUrl: './tabla-datos.component.html',
  styleUrl: './tabla-datos.component.css'
})
export class TablaDatosComponent {

  encabezadoGeneral = input<string>();
  columnas = input<Campos[]>([]);
  data = model<any[]>([]);
  accionesTemplate = input<TemplateRef<any>>();
  mostrarOpciones = input<boolean>(true);
  mostrarpaginado = input<boolean>(false);

  itemsPorPagina = signal<number>(5);
  paginaActual = signal(1);

  totalPaginas = computed(() => {
    const items = this.itemsPorPagina();
    if (items <= 0) return 1;
    return Math.max(1, Math.ceil(this.data().length / items));
  });

  datosPaginados = computed(() => {
    const items = this.itemsPorPagina();
    if (items <= 0) return this.data();
    const inicio = (this.paginaActual() - 1) * items;
    return this.data().slice(inicio, inicio + items);
  });

  get paginacionActiva(): boolean {
    return this.itemsPorPagina() > 0;
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual() - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual() + 1);
  }

  getPaginas(): number[] {
    const total = this.totalPaginas();
    const actual = this.paginaActual();
    const paginas: number[] = [];
    const rango = 2; // mostrar 2 páginas a cada lado de la actual

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= actual - rango && i <= actual + rango)) {
        paginas.push(i);
      }
    }
    return paginas;
  }

  CambiarItemPagina(event: Event) {
    const paginado = (event.target as HTMLSelectElement).value;
    this.itemsPorPagina.set(Number(paginado));
    this.paginaActual.set(1);
  }

}







