import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, } from 'rxjs';
import { Procedimiento } from '../interfaces/procedimiento.interface';


@Injectable({
  providedIn: 'root'
})

export class TablaProcedimientoService {

  private procedimientosSubject = new BehaviorSubject<Procedimiento[]>([]);
  procedimientos$ = this.procedimientosSubject.asObservable();

  agregarProcedimiento(p: Procedimiento) {
    const actuales = this.procedimientosSubject.getValue();
    this.procedimientosSubject.next([...actuales, p]);
  }

  getProcedimientos(): Observable<Procedimiento[]> {
    return this.procedimientos$
  }

  setProcedimientos(datos: Procedimiento[]) {
    this.procedimientosSubject.next(datos);
  }

}

