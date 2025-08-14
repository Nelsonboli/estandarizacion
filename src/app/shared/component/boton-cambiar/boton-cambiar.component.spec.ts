import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonCambiarComponent } from './boton-cambiar.component';

describe('BotonCambiarComponent', () => {
  let component: BotonCambiarComponent;
  let fixture: ComponentFixture<BotonCambiarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonCambiarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonCambiarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
