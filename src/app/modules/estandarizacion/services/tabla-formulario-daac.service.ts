import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TablaFormularioDAACService {

  private formularioDAACSubject = new BehaviorSubject<any[]>([]);
FormularioDAAC$ = this.formularioDAACSubject.asObservable();

  agregarDatosFormularioDAAC(p: any) {
    const actuales = this.formularioDAACSubject.getValue();
    this.formularioDAACSubject.next([...actuales, p]);
  }

  getDatosFormularioDAAC(): Observable<any[]> {
    return this.FormularioDAAC$
  }

  setDatosFormularioDAAC(datos: any[]) {
    this.formularioDAACSubject.next(datos);
  }

}
