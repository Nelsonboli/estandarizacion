import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private colapsadoSubject = new BehaviorSubject<boolean>(false);
  colapsado$ = this.colapsadoSubject.asObservable();

  toggle() {
    this.colapsadoSubject.next(!this.colapsadoSubject.value);
  }

  setColapsado(valor: boolean) {
    this.colapsadoSubject.next(valor);
  }

  get isColapsado(): boolean {
    return this.colapsadoSubject.value;
  }
}
