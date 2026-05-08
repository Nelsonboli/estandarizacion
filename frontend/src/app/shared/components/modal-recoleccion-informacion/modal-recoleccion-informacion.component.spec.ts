import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRecoleccionInformacionComponent } from './modal-recoleccion-informacion.component';

describe('ModalRecoleccionInformacionComponent', () => {
  let component: ModalRecoleccionInformacionComponent;
  let fixture: ComponentFixture<ModalRecoleccionInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRecoleccionInformacionComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ModalRecoleccionInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
