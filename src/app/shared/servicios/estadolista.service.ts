import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadolistaService {
  private _visible = new BehaviorSubject<boolean>(false);
  visible$ = this._visible.asObservable();

  abrir() {
    this._visible.next(true);
  }
  cerrar() {
    this._visible.next(false);
  }
}
