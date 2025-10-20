import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoporteComputacionalService {
private soporteComputacionalSubject = new BehaviorSubject<any>(null)


  soporteComputacional$: Observable<any> = this.soporteComputacionalSubject.asObservable();

  setSoporteComputacional(data:any) {
  this.soporteComputacionalSubject.next(data);
}

  getSoporteActual(): any {
    return this.soporteComputacionalSubject.getValue();
  }


  constructor() { }



  

}
