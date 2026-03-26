import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatearArray',
  standalone: true
})
export class FormatearArrayPipe implements PipeTransform {
  /**
   * @param value Valor a formatear (string o array)
   * @param tipo Tipo de viñeta o numeración: 'punto', 'guion', 'numero', 'custom'
   * @param simbolo Solo si tipo = 'custom', define el símbolo (por ejemplo '•', '→', etc.)
   */
  transform(value: any, tipo: 'punto' | 'guion' | 'numero' | 'custom' = 'punto', simbolo: string = '*'): string {
    if (!value) return '';

    // Si es un string plano (no array)
    if (typeof value === 'string') {
      return String(value);
    }
    // Si es un array de strings
    if (Array.isArray(value)) {
      return value
        .map((v, i) => this.formatearElemento(v, i, tipo, simbolo))
        .join('\n');
    }
    // Si no es ninguno de los anteriores
    return String(value);
  }

  private formatearElemento(texto: string, index: number, tipo: string, simbolo: string): string {
    switch (tipo) {
      case 'guion':
        return `- ${texto}`;
      case 'numero':
        return `${index + 1}. ${texto}`;
      case 'custom':
        return `${simbolo} ${texto}`;
      default:
        return `* ${texto}`;
    }
  }
}
