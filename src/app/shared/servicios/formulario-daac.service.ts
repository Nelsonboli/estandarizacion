import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormularioDAACService {

  constructor() { }


 private formularioDAACSubject = new BehaviorSubject<any[]>([]);
  formularioDAAC$ = this.formularioDAACSubject.asObservable();

  agregarProcedimiento(p: any) {
    const actuales = this.formularioDAACSubject.getValue();
    this.formularioDAACSubject.next([...actuales, p]);
  }

  geformularioDAAC(): Observable<any[]> {
    return this.formularioDAAC$;
  }

  setformularioDAAC(datos: any[]) {
    this.formularioDAACSubject.next(datos);
  }
}
