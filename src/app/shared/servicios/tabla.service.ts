import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TablaService {

  private procedimientosSubject = new BehaviorSubject<any[]>([]);
  procedimientos$ = this.procedimientosSubject.asObservable();

  agregarProcedimiento(p: any) {
    const actuales = this.procedimientosSubject.getValue();
    
    this.procedimientosSubject.next([...actuales, p]);
  }

  getProcedimientos(): Observable<any[]> {
    return this.procedimientos$;
  }

    setProcedimientos(datos: any[]) {
    this.procedimientosSubject.next(datos);
  }


}
