import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class TablaService {
 
  private estandarizaciones: { [id: string]: any } = {};

  private procedimientosSubject = new BehaviorSubject<any[]>([]);
  procedimientos$ = this.procedimientosSubject.asObservable();

  agregarProcedimiento(p: any) {
    const actuales = this.procedimientosSubject.getValue();
    this.procedimientosSubject.next([...actuales, p]);
  }

  getProcedimientos(): Observable<any[]> {
    return this.procedimientos$
  }

  setProcedimientos(datos: any[]) {
    this.procedimientosSubject.next(datos);
  }

  guardarEstandarizacion(id: string, datos: any) {
  this.estandarizaciones[id] = datos;
  localStorage.setItem('estandarizaciones', JSON.stringify(this.estandarizaciones));
}

getEstandarizacion(id: string) {
  const data = localStorage.getItem('estandarizaciones');
  if (data) {
    this.estandarizaciones = JSON.parse(data);
  }
  return this.estandarizaciones[id] || {};
}


}
